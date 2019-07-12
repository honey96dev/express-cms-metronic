import express from 'express';
import config from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const indexProc = (req, res, next) => {
    // console.log('alreadyLogin', req.session.propietarios);
    res.render('propietarios/propiedades/index', {
        userName: req.session.propietarios.name,
        title: 'Propiedades',
        baseUrl: config.server.propietariosBaseUrl,
        uri: 'propiedades',
        styles: [
            '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
            'stylesheets/site/propietarios/propiedades/index.css',
        ],
        scripts: [
            'javascripts/site/propietarios/propiedades/index.js',
        ],
    })
};

const listProc = (req, res, next) => {
    let sql = sprintfJs.sprintf("SELECT P.* FROM `properties` P;");
    dbConn.query(sql, null, (error, result, fields) => {
        if (error) {
            console.log(error);
            res.status(200).send({
                result: 'error',
                message: 'Error desconocido',
                data: [],
            });
            return;
        }

        res.status(200).send({
            result: 'success',
            data: result,
        });
    });
};

const addGetProc = (req, res, next) => {
    const params = req.query;
    const id = params.id;
    const types = ['Piso', 'Casa', 'Oficina', 'Local'];
    const rooms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const baths = [1, 2, 3, 4, 5];
    if (!!id) {
        let sql = sprintfJs.sprintf("SELECT P.* FROM `properties` P WHERE `id` = '%d';", id);
        dbConn.query(sql, null, (error, result, fields) => {
            if (error || result.length === 0) {
                res.status(404);

                // respond with html page
                if (req.accepts('html')) {
                    res.render('error/404', { baseUrl: config.server.propietariosBaseUrl });
                    return;
                }

                // respond with json
                if (req.accepts('json')) {
                    res.send({ error: 'Not found' });
                    return;
                }

                // default to plain-text. send()
                res.type('txt').send('Not found');
                return;
            }
            res.render('propietarios/propiedades/add', {
                userName: req.session.propietarios.name,
                title: 'Propiedades',
                baseUrl: config.server.propietariosBaseUrl,
                uri: 'propiedades/add',
                types,
                rooms,
                baths,
                method: 'put',
                data: result[0],
                styles: [
                    '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
                    'stylesheets/site/propietarios/propiedades/add.css',
                ],
                scripts: [
                    'javascripts/site/propietarios/propiedades/add.js',
                ],
            });
        });
    } else {
        // console.log('alreadyLogin', req.session.propietarios);
        res.render('propietarios/propiedades/add', {
            userName: req.session.propietarios.name,
            title: 'Propiedades',
            baseUrl: config.server.propietariosBaseUrl,
            uri: 'propiedades/add',
            types,
            rooms,
            baths,
            method: 'post',
            data: [],
            styles: [
                '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
                'stylesheets/site/propietarios/propiedades/add.css',
            ],
            scripts: [
                'javascripts/site/propietarios/propiedades/add.js',
            ],
        });
    }
};

const addSaveProc = (req, res, next) => {
    const method = req.method;
    console.log('method', method);
    const params = req.body;
    const id = params.id;
    const name = params.name;
    const address = params.address;
    const type = params.type;
    const rooms = params.rooms;
    const baths = params.baths;
    const surface = params.surface;
    const price = params.price;
    const accPrice = params.accPrice;

    let sql;
    if (method == 'POST') {
        sql = sprintfJs.sprintf("INSERT INTO `properties`(`name`, `address`, `type`, `rooms`, `baths`, `surface`, `price`, `accPrice`) VALUES('%s', '%s', '%s', %d, %d, %f, %f, %f);", name, address, type, rooms, baths, surface, price, accPrice);
    } else if (method == 'PUT') {
        sql = sprintfJs.sprintf("UPDATE `properties` SET `name` = '%s', `address` = '%s', `type` = '%s', `rooms` = '%d', `baths` = '%d', `surface` = '%f', `price` = '%f', `accPrice` = '%f' WHERE `id` = '%d';", name, address, type, rooms, baths, surface, price, accPrice, id);
    }
    dbConn.query(sql, null, (error, results, fields) => {
        if (error) {
            console.log(error);
            res.status(200).send({
                result: 'error',
                message: 'Error desconocido',
            });
            return;
        }

        res.status(200).send({
            result: 'success',
            message: 'Guardado correctamente',
        });
    });
};

router.get('/', indexProc);
router.get('/list', listProc);
router.get('/add', addGetProc);
router.post('/add', addSaveProc);
router.put('/add', addSaveProc);

module.exports = router;
