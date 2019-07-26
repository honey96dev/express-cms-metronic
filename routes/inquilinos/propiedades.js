import express from 'express';
import config from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const indexProc = (req, res, next) => {
    // console.log('alreadyLogin', req.session.inquilinos);
    res.render('inquilinos/propiedades/index', {
        userName: req.session.inquilinos.name,
        title: 'Propiedades',
        baseUrl: config.server.inquilinosBaseUrl,
        uri: 'propiedades',
        styles: [
            '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
            'stylesheets/site/inquilinos/propiedades/index.css',
        ],
        scripts: [
            'javascripts/site/inquilinos/propiedades/index.js',
        ],
    })
};

const listProc = (req, res, next) => {
    const userId = req.session.inquilinos.id;
    let sql = sprintfJs.sprintf("SELECT P.*, IFNULL(R.fileNames, '') `photos` FROM `%s` P LEFT JOIN `%s` R ON R.property_id = P.id WHERE `userId` = '%d' ORDER BY `creationDate`;", config.dbTblName.properties, config.dbTblName.property_photos, userId);
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

        let photos;
        for (let row of result) {
            photos = row['photos'].split('*')
            row['photo'] = photos[0];
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
                    res.render('error/404', { baseUrl: config.server.inquilinosBaseUrl });
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
            res.render('inquilinos/propiedades/add', {
                userName: req.session.inquilinos.name,
                title: 'Nueva Propiedad',
                baseUrl: config.server.inquilinosBaseUrl,
                uri: 'propiedades',
                types,
                rooms,
                baths,
                method: 'put',
                data: result[0],
                styles: [
                    '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
                    'stylesheets/site/inquilinos/propiedades/add.css',
                ],
                scripts: [
                    'javascripts/site/inquilinos/propiedades/add.js',
                ],
            });
        });
    } else {
        // console.log('alreadyLogin', req.session.inquilinos);
        res.render('inquilinos/propiedades/add', {
            userName: req.session.inquilinos.name,
            title: 'Nueva Propiedad',
            baseUrl: config.server.inquilinosBaseUrl,
            uri: 'propiedades',
            types,
            rooms,
            baths,
            method: 'post',
            data: [],
            styles: [
                '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
                'stylesheets/site/inquilinos/propiedades/add.css',
            ],
            scripts: [
                'javascripts/site/inquilinos/propiedades/add.js',
            ],
        });
    }
};

const addSaveProc = (req, res, next) => {
    const method = req.method;
    console.log('method', method);
    const params = req.body;
    const id = params.id;
    const userId = req.session.inquilinos.id;
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
        let today = new Date();
        today = sprintfJs.sprintf("%02d/%02d/%04d", today.getDate(), today.getMonth() + 1, today.getFullYear());
        sql = sprintfJs.sprintf("INSERT INTO `properties`(`userId`, `name`, `address`, `type`, `rooms`, `baths`, `surface`, `price`, `accPrice`, `creationDate`) VALUES('%d', '%s', '%s', '%s', %d, %d, %f, %f, %f, '%s');", userId, name, address, type, rooms, baths, surface, price, accPrice, today);
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

const deleteProc = (req, res, next) => {
    const params = req.body;
    const documentId = params.documentId;
    let sql = sprintfJs.sprintf("DELETE FROM `%s` WHERE `id` = '%d';", config.dbTblName.properties, documentId);
    dbConn.query(sql, null, (error, result, fields) => {
        if (error) {
            res.status(200).send({
                result: 'error',
                message: 'Error desconocido',
                error: error,
            });
        }  else {
            res.status(200).send({
                result: 'success',
                message: 'Eliminado correctamente',
            });
        }
    });
};

router.get('/', indexProc);
router.get('/list', listProc);
router.get('/nueva', addGetProc);
router.post('/nueva', addSaveProc);
router.put('/nueva', addSaveProc);
router.delete('/delete', deleteProc);

module.exports = router;
