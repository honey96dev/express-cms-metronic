import express from 'express';
import config from '../core/config';
import dbConn from '../core/dbConn';
import sprintfJs from 'sprintf-js';
import mailer from '../core/mailer';
import myCrypto from '../core/myCrypto';

function sendVerificationEmail(email, name) {
    const token = myCrypto.hmacHex(new Date().toISOString());
    let expire = new Date().getTime() + 300000;
    const sql = sprintfJs.sprintf("INSERT INTO `tokens`(`token`, `expire`, `email`) VALUES('%s', '%d', '%s');", token, expire, email);
    dbConn.query(sql, null, (error, results, fields) => {
        if (!error) {
            const tokenUrl = sprintfJs.sprintf('%susers/verifyEmail?token=%s&email=%s&name=%s', config.server.baseUrl, token, email, name);
            mailer.sendVerificationMail(email, name, tokenUrl);
        }
    });
}

const router = express.Router();

const loginProc = (req, res, next) => {
    const method = req.method.toUpperCase();
    if (method === 'POST') {
        const params = req.body;
        const email = params.email.trim();
        const password = params.password.trim();
        const hash = myCrypto.hmacHex(password);

        let sql = sprintfJs.sprintf("SELECT COUNT(`email`) `count` FROM `users` WHERE BINARY `email` = '%s';", email);
        dbConn.query(sql, null, (error, results, fields) => {
            if (error) {
                res.status(200).send({
                    result: 'error',
                    message: 'Error desconocido',
                    // message: '//Unknown error',
                });
                return;
            }
            const count = parseInt(results[0].count);

            if (count === 0) {
                res.status(200).send({
                    result: 'error',
                    message: 'Email inválido',
                    // message: 'Your Email is Invalid',
                });
                return;
            }
            sql = sprintfJs.sprintf("SELECT COUNT(U.email) `count`,  U.* FROM `users` U WHERE BINARY U.email = '%s' AND BINARY U.password = '%s';", email, hash);
            console.log('login', sql);
            dbConn.query(sql, null, (error, results, fields) => {
                if (error) {
                    res.status(200).send({
                        result: 'error',
                        message: 'Error desconocido',
                        // message: '//Unknown error',
                    });
                    return;
                }
                const count = parseInt(results[0].count);

                if (count === 0) {
                    res.status(200).send({
                        result: 'error',
                        message: 'Contraseña inválida',
                        // message: 'Your password is invalid',
                    });
                } else {
                    req.session.user = {
                        id: results[0].id,
                        email: results[0].email,
                        name: results[0].name,
                    };
                    res.status(200).send({
                        result: 'success',
                        message: 'Logado con éxito',
                        // message: 'Successfully logined',
                    });
                }
            });
        });
    } else if (method === 'GET') {
        res.render('users/login', {baseUrl: config.server.baseUrl});
    } else {
        res.status(404).send('No encontrado');
        // res.status(404).send('Not found');
    }
};

const signupProc = (req, res, next) => {
    const method = req.method.toUpperCase();
    if (method === 'POST') {
        // Signup logic
        const params = req.body;
        const email = params.email.trim();
        const password = params.password.trim();
        const name = params.name.trim();
        const hash = myCrypto.hmacHex(password);

        let sql = sprintfJs.sprintf("SELECT COUNT(`email`) `count` FROM `users` WHERE BINARY `email` = '%s';", email);
        dbConn.query(sql, null, (error, results, fields) => {
            if (error) {
                res.status(200).send({
                    result: 'error',
                    message: 'Error desconocido',
                    // message: '//Unknown error',
                });
                return;
            }
            const count = parseInt(results[0].count);

            if (count > 0) {
                res.status(200).send({
                    result: 'error',
                    message: 'Este email ya está registrado',
                    // message: 'This email is already registered',
                });
                return;
            }
            sql = sprintfJs.sprintf("INSERT INTO `users`(`email`, `password`, `name`, `emailVerified`, `allow`) VALUES('%s', '%s', '%s', '0', '0');",
                email, hash, name);
            dbConn.query(sql, null, (error, results, fields) => {
                if (error) {
                    res.status(200).send({
                        result: 'error',
                        message: 'Error desconocido',
                        // message: '//Unknown error',
                    });
                    return;
                }
                sendVerificationEmail(email, name);
                res.status(200).send({
                    result: 'success',
                    message: 'Registrado con éxito. Te hemos enviado un email para activar tu cuenta.',
                    // message: 'Successfully registered. Please activate your account by validation email.',
                });
            });
        });
    } else if (method === 'GET') {
        res.render('users/signup', {baseUrl: config.server.baseUrl});
    } else {
        res.status(404).send('Not found');
    }
};



router.all('/', loginProc);

router.all('/login', loginProc);

router.all('/signup', signupProc);

router.all('/logout', (req, res, next) => {
    const method = req.method.toUpperCase();
    if (method !== 'POST' && method !== 'GET') {
        res.status(404).send('Not found');
    } else {
        req.session.user = undefined;
        if (req.xhr) {
            res.status(200).send({
                baseUrl: config.server.baseUrl,
                result: 'success',
                message: 'Desconectado con éxito',
                // message: 'Successfully logouted',
            });
        } else {
            // res.redirect(config.server.baseUrl);
            res.redirect('/');
        }
    }
});

router.get('/verifyEmail', (req, res, next) => {
    const token = req.query.token;
    const email = req.query.email;
    const name = req.query.name;
    let sql = sprintfJs.sprintf("SELECT COUNT(T.token) `count`, T.*, U.name FROM `tokens` T JOIN `users` U ON U.email = T.email WHERE BINARY T.token = '%s';", token);
    const successView = 'users/verifyEmail/success';
    const failView = 'users/verifyEmail/fail';
    dbConn.query(sql, null, (error, results, fields) => {
        if (error) {
            res.render(failView, {
                baseUrl: config.server.baseUrl,
                result: 'error',
                message: 'Lo sentimos. Error desconocido.',
                // message: 'Sorry! Unknown error',
                email: email,
                name: name,
            });
            return;
        }
        const count = parseInt(results[0].count);

        if (count === 0) {
            res.render(failView, {
                baseUrl: config.server.baseUrl,
                result: 'error',
                message: 'Lo sentimos. Tu cuenta no ha podido ser activada. Token inválido.',
                // message: 'Sorry! Your account can not be activated. Your token is invalid.',
                email: email,
                name: name,
            });
        } else {
            const timestamp = new Date().getTime();
            const expire = parseInt(results[0].expire);
            console.log('verify', timestamp, expire);
            if (timestamp < expire) {
                sql = sprintfJs.sprintf("UPDATE `users` SET `emailVerified` = 1 WHERE BINARY `email` = '%s';", results[0].email);
                dbConn.query(sql, null, (error) => {
                    if (error) {
                        res.render(failView, {
                            baseUrl: config.server.baseUrl,
                            result: 'error',
                            message: 'Lo sentimos. Error desconocido.',
                            // message: 'Sorry! Unknown error',
                            email: email,
                            name: name,
                        });
                    } else {
                        res.render(successView, {
                            baseUrl: config.server.baseUrl,
                            result: 'success',
                            message: 'Tu cuenta ha sido activada con éxito, ahora puedes disfrutar de tu cuenta de Alquilerista',
                            // message: 'Your account is successfully activated. Now you can use our website.',
                            email: email,
                            name: name,
                        });
                    }
                });
            } else {
                res.render(failView, {
                    baseUrl: config.server.baseUrl,
                    result: 'error',
                    message: 'Lo sentimos. Tu cuenta no ha podido ser activada. Token caducado.',
                    // message: 'Sorry! Your account can not be activated. Your token is expired.',
                    email: email,
                    name: name,
                });
            }
        }
    });
});

router.post('/sendVerificationEmail', (req, res, next) => {
    if (req.xhr) {
        const email = req.body.email;

        let sql = sprintfJs.sprintf("DELETE FROM `tokens` WHERE BINARY `email` = '%s';", email);
        dbConn.query(sql, null, (error, results, fields) => {
            if (error) {
                res.status(200).send({
                    email: email,
                    result: 'error',
                    message: 'Lo sentimos. Error desconocido.',
                    // message: 'Sorry! Unknown error',
                });
            } else {
                sql = sprintfJs.sprintf("SELECT COUNT(`name`) `count`, `name` FROM `users` WHERE BINARY `email` = '%s';", email);
                dbConn.query(sql, null, (error, results, fields) => {
                    if (error) {
                        res.status(200).send({
                            email: email,
                            result: 'error',
                            message: 'Lo sentimos. Error desconocido.',
                            // message: 'Sorry! Unknown error',
                        });
                    } else {
                        if (!!results && parseInt(results[0].count) > 0) {
                            sendVerificationEmail(email, results[0].name);
                            res.status(200).send({
                                email: email,
                                result: 'success',
                                message: 'Enviado con éxito',
                                // message: 'Successfully sent',
                            });
                        } else {
                            res.status(200).send({
                                email: email,
                                result: 'error',
                                message: 'Lo sentimos. Error desconocido.',
                                // message: 'Sorry! Unknown error',
                            });
                        }
                    }
                });
            }
        });
    } else {
        res.status(404).send('No encontrado');
        // res.status(404).send('Not found');
    }
});

module.exports = router;
