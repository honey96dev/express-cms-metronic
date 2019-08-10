import express from 'express';
import config from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';
import mailer from '../../core/mailer';
import myCrypto from '../../core/myCrypto';

const router = express.Router();

const sendVerificationEmail = (email, name) => {
    const token = myCrypto.hmacHex(new Date().toISOString());
    let expire = new Date().getTime() + 300000;
    const sql = sprintfJs.sprintf("INSERT INTO `tokens`(`token`, `expire`, `email`) VALUES ('%s', '%d', '%s');", token, expire, email);
    dbConn.query(sql, null, (error, results, fields) => {
        if (!error) {
            const tokenUrl = sprintfJs.sprintf('%sregistro/verifyEmail?token=%s&email=%s&name=%s', config.server.propietariosBaseUrl, token, email, name);
            mailer.sendVerificationMail(email, name, tokenUrl, "propietarios");
        }
    });
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

        let sql = sprintfJs.sprintf("SELECT COUNT(`email`) `count` FROM `%s` WHERE BINARY `email` = '%s' and site='Propietarios';", config.dbTblName.propietarios, email);
        dbConn.query(sql, null, (error, results, fields) => {
            if (error) {
                res.status(200).send({
                    result: 'error',
                    message: 'Error desconocido',
                    error: error,
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
            const today = new Date();
            const date = sprintfJs.sprintf("%04d-%02d-%02d", today.getFullYear(), today.getMonth() + 1, today.getDate());
            sql = sprintfJs.sprintf("INSERT INTO `%s`(`email`, `password`, `name`, `createdDate`, `emailVerified`, `allow`, `site`) VALUES('%s', '%s', '%s', '%s', '0', '0', 'Propietarios');", config.dbTblName.propietarios,
                email, hash, name, date);
            dbConn.query(sql, null, (error, results, fields) => {
                if (error) {
                    res.status(200).send({
                        result: 'error',
                        message: 'Error desconocido',
                        error: error,
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
        res.render('propietarios/signup', {baseUrl: config.server.propietariosBaseUrl});
    } else {
        res.status(404).send('Not found');
    }
};

router.all('/', signupProc);

router.get('/verifyEmail', (req, res, next) => {
    const token = req.query.token;
    const email = req.query.email;
    const name = req.query.name;
    let sql = sprintfJs.sprintf("SELECT T.*, U.name FROM `tokens` T JOIN `%s` U ON U.email = T.email WHERE BINARY T.token = '%s' and U.site='Propietarios';", config.dbTblName.propietarios, token);
    const successView = 'propietarios/verifyEmail/success';
    const failView = 'propietarios/verifyEmail/fail';
    dbConn.query(sql, null, (error, results, fields) => {
        if (error) {
            res.render(failView, {
                baseUrl: config.server.propietariosBaseUrl,
                result: 'error',
                message: 'Lo sentimos. Error desconocido.',
                error: error,
                // message: 'Sorry! Unknown error',
                email: email,
                name: name,
            });
            return;
        }
        const count = results.length;

        if (count === 0) {
            res.render(failView, {
                baseUrl: config.server.propietariosBaseUrl,
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
                sql = sprintfJs.sprintf("UPDATE `%s` SET `emailVerified` = 1 WHERE BINARY `email` = '%s'  and site='Propietarios';", config.dbTblName.propietarios, results[0].email);
                dbConn.query(sql, null, (error) => {
                    if (error) {
                        res.render(failView, {
                            baseUrl: config.server.propietariosBaseUrl,
                            result: 'error',
                            message: 'Lo sentimos. Error desconocido.',
                            error: error,
                            // message: 'Sorry! Unknown error',
                            email: email,
                            name: name,
                        });
                    } else {
                        res.render(successView, {
                            baseUrl: config.server.propietariosBaseUrl,
                            result: 'success',
                            message: 'Tu cuenta ha sido activada con éxito, ahora puedes disfrutar de tu cuenta de ',
                            // message: 'Your account is successfully activated. Now you can use our website.',
                            email: email,
                            name: name,
                        });
                    }
                });
            } else {
                res.render(failView, {
                    baseUrl: config.server.propietariosBaseUrl,
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
    // console.log('sendVerificationEmail');
    if (req.xhr) {
        const email = req.body.email;
        // console.log('sendVerificationEmail', email);

        let sql = sprintfJs.sprintf("DELETE FROM `tokens` WHERE BINARY `email` = '%s';", email);
        dbConn.query(sql, null, (error, results, fields) => {
            if (error) {
                res.status(200).send({
                    email: email,
                    result: 'error',
                    message: 'Lo sentimos. Error desconocido.',
                    error: error,
                    // message: 'Sorry! Unknown error',
                });
            } else {
                sql = sprintfJs.sprintf("SELECT `name` FROM `%s` WHERE BINARY `email` = '%s' and site='Propietarios';", config.dbTblName.propietarios, email);
                // console.log('verify-email', sql);
                dbConn.query(sql, null, (error, results, fields) => {
                    if (error) {
                        res.status(200).send({
                            email: email,
                            result: 'error',
                            message: 'Lo sentimos. Error desconocido.',
                            error: error,
                            // message: 'Sorry! Unknown error',
                        });
                    } else {
                        // console.log('verify-email-sql-result', results);
                        if (!!results && results.length > 0) {
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
