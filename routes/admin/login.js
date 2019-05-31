import express from 'express';
import config from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';
import myCrypto from '../../core/myCrypto';

const router = express.Router();

const loginProc = (req, res, next) => {
    const method = req.method.toUpperCase();
    if (method === 'POST') {
        const params = req.body;
        const email = params.email.trim();
        const password = params.password.trim();
        const hash = myCrypto.hmacHex(password);

        let sql = sprintfJs.sprintf("SELECT COUNT(`email`) `count` FROM `%s` WHERE BINARY `email` = '%s';", config.dbTblName.admins, email);
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

            if (count === 0) {
                res.status(200).send({
                    result: 'error',
                    message: 'Email inválido',
                    // message: 'Your Email is Invalid',
                });
                return;
            }
            sql = sprintfJs.sprintf("SELECT U.* FROM `%s` U WHERE BINARY U.email = '%s' AND BINARY U.password = '%s';", config.dbTblName.admins, email, hash);
            console.log('login', sql);
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
                const count = results.length;

                if (count === 0) {
                    res.status(200).send({
                        result: 'error',
                        message: 'Contraseña inválida',
                        // message: 'Your password is invalid',
                    });
                } else {
                    req.session.admin = {
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
        res.render('admin/login', {baseUrl: config.server.adminBaseUrl});
    } else {
        res.status(404).send('No encontrado');
        // res.status(404).send('Not found');
    }
};

const logoutProc = (req, res, next) => {
    const method = req.method.toUpperCase();
    if (method !== 'POST' && method !== 'GET') {
        res.status(404).send('Not found');
    } else {
        req.session.admin = undefined;
        if (req.xhr) {
            res.status(200).send({
                baseUrl: config.server.adminBaseUrl,
                result: 'success',
                message: 'Desconectado con éxito',
                // message: 'Successfully logouted',
            });
        } else {
            // res.redirect(config.server.adminBaseUrl);
            res.redirect('/');
        }
    }
};

router.all('/', loginProc);

// router.all('/login', loginProc);

router.all('/logout', logoutProc);

module.exports = router;
