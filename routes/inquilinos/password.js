import express from 'express';
import config from '../../core/config';
import dbConn from '../../core/dbConn';
import mailer from '../../core/mailer';
import sprintfJs from 'sprintf-js';
import myCrypto from "../../core/myCrypto";

const router = express.Router();

const sendResetPasswordEmail = (email, name) => {
    const token = myCrypto.hmacHex(new Date().toISOString());
    let expire = new Date().getTime() + 300000;
    const sql = sprintfJs.sprintf("INSERT INTO `%s`(`token`, `expire`, `email`) VALUES('%s', '%d', '%s');", config.dbTblName.tokens, token, expire, email);
    dbConn.query(sql, null, (error, results, fields) => {
        if (!error) {
            const tokenUrl = sprintfJs.sprintf('%spassword/resetPassword?token=%s&email=%s&name=%s', config.server.inquilinosBaseUrl, token, email, name);
            mailer.sendResetPasswordMail(email, name, tokenUrl);
        }
    });
};

const requestResetPasswordGetProc = (req, res, next) => {
    res.render('users/requestResetPassword', {
        title: 'Reset Password',
        baseUrl: config.server.inquilinosBaseUrl,
    });
};

const requestResetPasswordPostProc = (req, res, next) => {
    const params = req.body;
    const email = params.email.trim();
    let sql = sprintfJs.sprintf("SELECT * FROM `%s` WHERE BINARY `email` = '%s';", config.dbTblName.propietarios, email);
    dbConn.query(sql, undefined, (error, results, fields) => {
        if (error) {
            console.log(error);
            res.status(200).send({
                result: 'error',
                message: 'Lo sentimos. Error desconocido.',
                // message: 'Unknown error',
            });
            return;
        }
        if (results && results.length > 0) {
            sendResetPasswordEmail(email, results[0].name);
            res.status(200).send({
                result: 'success',
                message: 'Email para recuperar contraseña enviado',
                // message: 'Unknown error',
            });
        } else {
            res.status(200).send({
                result: 'error',
                message: 'Tu email no pertenece a un usuario del sitio',
                // message: 'Unknown error',
            });
        }
    });
};

const resetPasswordGetProc = (req, res, next) => {
    const token = req.query.token;
    const email = req.query.email.trim();
    const name = req.query.name.trim();
    let sql = sprintfJs.sprintf("SELECT T.*, U.name FROM `%s` T JOIN `%s` U ON U.email = T.email WHERE BINARY T.token = '%s';", config.dbTblName.tokens, config.dbTblName.propietarios, token);
    const successView = 'users/resetPassword/success';
    const failView = 'users/resetPassword/fail';
    dbConn.query(sql, null, (error, results, fields) => {
        if (error) {
            res.render(failView, {
                baseUrl: config.server.inquilinosBaseUrl,
                result: 'error',
                message: 'Lo sentimos. Error desconocido.',
                error: error,
                // message: 'Sorry! Unknown error',
                email: email,
                name: name,
                token: token,
            });
            return;
        }
        const count = results ? results.length : 0;

        if (count === 0) {
            res.render(failView, {
                baseUrl: config.server.inquilinosBaseUrl,
                result: 'error',
                // message: 'Lo sentimos. Tu cuenta no ha podido ser activada. Token inválido.',
                message: 'Lo sentimos. No puedes resetear tu contraseña.',
                email: email,
                name: name,
                token: token,
            });
        } else {
            const timestamp = new Date().getTime();
            const expire = parseInt(results[0].expire);
            console.log('verify', timestamp, expire);
            if (timestamp < expire) {
                res.render(successView, {
                    baseUrl: config.server.inquilinosBaseUrl,
                    result: 'success',
                    // message: 'Tu cuenta ha sido activada con éxito, ahora puedes disfrutar de tu cuenta de ',
                    message: 'Por favor, introduce la nueva contraseña',
                    email: email,
                    name: name,
                    token: token,
                });
            } else {
                res.render(failView, {
                    baseUrl: config.server.inquilinosBaseUrl,
                    result: 'error',
                    // message: 'Lo sentimos. Tu cuenta no ha podido ser activada. Token caducado.',
                    message: 'Lo sentimos. No puedes resetear tu contraseña.',
                    email: email,
                    name: name,
                    token: token,
                });
            }
        }
    });
};

const resetPasswordPostProc = (req, res, next) => {
    const params = req.body;
    const email = params.email.trim();
    const password = params.password.trim();
    const token = params.token.trim();
    const hash = myCrypto.hmacHex(password);
    let sql = sprintfJs.sprintf("SELECT T.*, U.name FROM `%s` T JOIN `%s` U ON U.email = T.email WHERE BINARY T.token = '%s';", config.dbTblName.tokens, config.dbTblName.propietarios, token);
    dbConn.query(sql, null, (error, results, fields) => {
        if (error) {
            res.status(200).send({
                result: 'error',
                message: 'Lo sentimos. Error desconocido.',
                // message: 'Unknown error',
            });
            return;
        }
        const count = results ? results.length : 0;

        if (count === 0) {
            res.status(200).send({
                result: 'error',
                // message: 'Lo sentimos. Tu cuenta no ha podido ser activada. Token inválido.',
                message: 'Lo sentimos. No puedes resetear tu contraseña.',
            });
        } else {
            const timestamp = new Date().getTime();
            const expire = parseInt(results[0].expire);
            console.log('verify', timestamp, expire);
            if (timestamp < expire) {
                sql = sprintfJs.sprintf("UPDATE `%s` SET `password` = '%s' WHERE BINARY `email` = '%s';", config.dbTblName.propietarios, hash, email);
                dbConn.query(sql, undefined, (error, results, fields) => {
                    if (error) {
                        res.status(200).send({
                            result: 'error',
                            message: 'Lo sentimos. Error desconocido.',
                            // message: 'Unknown error',
                        });
                    } else {
                        res.status(200).send({
                            result: 'success',
                            // message: 'Lo sentimos. Tu cuenta no ha podido ser activada. Token inválido.',
                            message: 'Tu contraseña se ha modificado con éxito',
                        });
                    }
                });
            } else {
                res.status(200).send({
                    result: 'error',
                    // message: 'Lo sentimos. Tu cuenta no ha podido ser activada. Token inválido.',
                    message: 'Lo sentimos. No puedes resetear tu contraseña.',
                });
            }
        }
    });
};

router.get('/requestResetPassword', requestResetPasswordGetProc);

router.post('/requestResetPassword', requestResetPasswordPostProc);

router.get('/resetPassword', resetPasswordGetProc);

router.post('/resetPassword', resetPasswordPostProc);

module.exports = router;
