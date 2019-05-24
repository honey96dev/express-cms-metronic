import express from 'express';
import config from '../core/config';
import dbConn from '../core/dbConn';
import sprintfJs from 'sprintf-js';
import mailer from '../core/mailer';
import myCrypto from '../core/myCrypto';

function sendVerificationEmail(email) {
    const token = myCrypto.hmacHex(new Date().toISOString());
    let expire = new Date(new Date().getTime() + 300000).toISOString();
    const sql = sprintfJs.sprintf("INSERT INTO `tokens`(`token`, `expire`, `email`) VALUES('%s', '%s', '%s');", token, expire, email);
    dbConn.query(sql, null, (error, results, fields) => {
        if (!error) {
            const tokenUrl = sprintfJs.sprintf('%susers/verify_email?token=%s', config.server.baseUrl, token);
            mailer.sendVerificationMail(email, tokenUrl);
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
                });
                return;
            }
            const count = parseInt(results[0].count);

            if (count === 0) {
                res.status(200).send({
                    result: 'error',
                    message: 'Tu Correo Electrónico es Inválido',
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
                    });
                    return;
                }
                const count = parseInt(results[0].count);

                if (count === 0) {
                    res.status(200).send({
                        result: 'error',
                        message: 'Su contraseña es inválida',
                    });
                } else {
                    req.session.user = {
                        id: results[0].id,
                        email: results[0].email,
                        name: results[0].name,
                    };
                    res.status(200).send({
                        result: 'success',
                        message: 'Registrado exitosamente',
                    });
                }
            });
        });
    } else if (method === 'GET') {
        res.render('users/login', {baseUrl: config.server.baseUrl});
    } else {
        res.status(404).send('Not found');
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
                });
                return;
            }
            const count = parseInt(results[0].count);

            if (count > 0) {
                res.status(200).send({
                    result: 'error',
                    message: 'Este correo electrónico ya está registrado',
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
                    });
                    return;
                }
                sendVerificationEmail(email);
                res.status(200).send({
                    result: 'success',
                    message: 'Registrado exitosamente. Por favor, active su cuenta mediante correo electrónico de validación.',
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
        res.status(200).send({
            result: 'success',
            message: 'Se ha cerrado la sesión correctamente.',
        });
    }
});

router.get('/verify_email', (req, res, next) => {
    const token = req.query.token;
    let sql = sprintfJs.sprintf("SELECT COUNT(T.token) `count`, T.* FROM `tokens` T WHERE BINARY T.token = '%s';", token);
    dbConn.query(sql, null, (error, results, fields) => {
        if (error) {
            res.status(200).send({
                result: 'error',
                message: 'Error desconocido',
            });
            return;
        }
        const count = parseInt(results[0].count);

        if (count === 0) {
            res.status(200).send({
                result: 'error',
                message: 'Su contraseña es inválida',
            });
        } else {

        }
    });
});

module.exports = router;
