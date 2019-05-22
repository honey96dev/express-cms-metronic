import express from 'express';
import config from '../core/config';
import dbConn from '../core/dbConn';
import sprintfJs from 'sprintf-js';
import bcrypt from 'bcrypt';
import mailer from '../core/mailer';

const router = express.Router();

const loginProc = (req, res, next) => {
    const method = req.method;
    if (method !== 'GET' && method !== 'POST') {
        res.status(404).send('Not found');
        return;
    }
    res.render('users/login', {baseUrl: config.server.baseUrl});
};

const signupProc = (req, res, next) => {
    const method = req.method;
    if (method === 'POST') {
        // Signup logic
        const params = req.body;
        const email = params.email;
        const password = params.password;
        const name = params.name;
        const hash = bcrypt.hashSync(password, 10);

        let sql = sprintfJs.sprintf("SELECT COUNT(`email`) `count` FROM `users` WHERE `email` = '%s';", email);
        dbConn.query(sql, null, (error, results, fields) => {
            if (error) {
                console.log(error);
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
                } else {
                    let tokenUrl = '';
                    mailer.sendVerificationMail(email, tokenUrl);
                    res.status(200).send({
                        result: 'success',
                        message: 'Registrado exitosamente. Por favor, active su cuenta mediante correo electrónico de validación.',
                    });
                }
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

module.exports = router;
