import express from 'express';
import config from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const indexProc = (req, res, next) => {
    // console.log('alreadyLogin', req.session.propietarios);
    res.render('admin/propiedades/index', {
        userName: req.session.admin.name,
        title: 'Propiedades',
        baseUrl: config.server.adminBaseUrl,
        uri: 'propiedades',
        styles: [
            'vendors/general/material-design-lite/material.css',
            'vendors/general/jquery-datatable/css/dataTables.material.css',
            'stylesheets/site/admin/propiedades/index.css',
        ],
        scripts: [
            'vendors/general/jquery-datatable/js/dataTables.responsive.min.js',
            'vendors/general/jquery-datatable/js/dataTables.bootstrap4.js',
            'javascripts/site/admin/propiedades/index.js',
        ],
    })
};

const listProc = (req, res, next) => {
    // const userId = req.session.admin.id;
    let sql = sprintfJs.sprintf("SELECT P.*, IFNULL(R.fileNames, '') `photos`, U.name `userName` FROM `%s` P LEFT JOIN `%s` R ON R.property_id = P.id JOIN `%s` U ON U.id = P.userId ORDER BY `creationDate`;", config.dbTblName.properties, config.dbTblName.property_photos, config.dbTblName.propietarios);
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
            photos = row['photos'].split('*');
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

    let sql = sprintfJs.sprintf("SELECT * FROM `%s`;", config.dbTblName.propietarios);
    dbConn.query(sql, null, (error, users, fields) => {
        if (error) {
            users = [];
        }
        if (!!id) {
            let sql = sprintfJs.sprintf("SELECT P.* FROM `%s` P WHERE `id` = '%d';", config.dbTblName.properties, id);
            dbConn.query(sql, null, (error, result, fields) => {
                if (error || result.length === 0) {
                    res.status(404);

                    // respond with html page
                    if (req.accepts('html')) {
                        res.render('error/404', { baseUrl: config.server.adminBaseUrl });
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
                res.render('admin/propiedades/add', {
                    userName: req.session.admin.name,
                    title: 'Nueva Propiedad',
                    baseUrl: config.server.adminBaseUrl,
                    uri: 'propiedades',
                    types,
                    rooms,
                    baths,
                    users,
                    method: 'put',
                    data: result[0],
                    styles: [
                        '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
                        'stylesheets/site/admin/propiedades/add.css',
                    ],
                    scripts: [
                        'javascripts/site/admin/propiedades/add.js',
                    ],
                });
            });
        } else {
            // console.log('alreadyLogin', req.session.propietarios);
            res.render('admin/propiedades/add', {
                userName: req.session.admin.name,
                title: 'Nueva Propiedad',
                baseUrl: config.server.adminBaseUrl,
                uri: 'propiedades',
                types,
                rooms,
                baths,
                users,
                method: 'post',
                data: [],
                styles: [
                    '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
                    'stylesheets/site/admin/propiedades/add.css',
                ],
                scripts: [
                    'javascripts/site/admin/propiedades/add.js',
                ],
            });
        }
    });
};

const addSaveProc = (req, res, next) => {
    const method = req.method;
    console.log('method', method);
    const params = req.body;
    const id = params.id;
    const userId = params.userId;
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
        sql = sprintfJs.sprintf("UPDATE `properties` SET `userId` = '%d', `name` = '%s', `address` = '%s', `type` = '%s', `rooms` = '%d', `baths` = '%d', `surface` = '%f', `price` = '%f', `accPrice` = '%f' WHERE `id` = '%d';", userId, name, address, type, rooms, baths, surface, price, accPrice, id);
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
    const itemId = params.itemId;
    let sql = sprintfJs.sprintf("DELETE FROM `%s` WHERE `id` = '%d';", config.dbTblName.properties, itemId);
    dbConn.query(sql, null, (error, result, fields) => {
        if (error) {
            res.status(200).send({
                result: 'error',
                message: 'Error desconocido',
                error: error,
            });
        }  else {
            sql = sprintfJs.sprintf("SELECT P.*, IFNULL(R.fileNames, '') `photos`, U.name `userName` FROM `%s` P LEFT JOIN `%s` R ON R.property_id = P.id JOIN `%s` U ON U.id = P.userId;", config.dbTblName.properties, config.dbTblName.property_photos, config.dbTblName.propietarios);
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
                    photos = row['photos'].split('*');
                    row['photo'] = photos[0];
                }

                res.status(200).send({
                    result: 'success',
                    data: result,
                });
            });
        }
    });
};

// const usersProc = (req, res, next) => {
//     let sql = sprintfJs.sprintf("SELECT * FROM `%s`;", config.dbTblName.properties);
//     dbConn.query(sql, null, (error, result, fields) => {
//         if (error) {
//             res.status(200).send({
//                 result: 'error',
//                 message: 'Error desconocido',
//                 data: [],
//             });
//         } else {
//             res.status(200).send({
//                 result: 'success',
//                 data: result,
//             });
//         }
//     });
// };

router.get('/', indexProc);
router.get('/list', listProc);
router.get('/nueva', addGetProc);
router.post('/nueva', addSaveProc);
router.put('/nueva', addSaveProc);
router.delete('/delete', deleteProc);
// router.get('/users', usersProc);

module.exports = router;
