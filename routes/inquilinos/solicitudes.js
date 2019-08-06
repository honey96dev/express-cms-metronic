import express from 'express';
import config, {dbTblName} from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';
import uuid from 'uuid';
import path from 'path';
import trovitXml from "../../core/trovitXml";

const router = express.Router();

const indexProc = (req, res, next) => {
    // console.log('alreadyLogin', req.session.inquilinos);
    res.render('inquilinos/solicitudes/index', {
        userName: req.session.inquilinos.name,
        title: 'Applications',
        baseUrl: config.server.inquilinosBaseUrl,
        uri: 'anuncios',
        styles: [
            '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
            'stylesheets/site/inquilinos/solicitudes/index.css',
        ],
        scripts: [
            'javascripts/site/inquilinos/solicitudes/index.js',
        ],
    })
};

const listProc = (req, res, next) => {
    const userId = req.session.inquilinos.id;
    let sql = sprintfJs.sprintf("SELECT A.id as application_id, P.*, IFNULL(R.fileNames, '') `photos` FROM `%s` A LEFT JOIN `%s` P ON A.home_id=P.id " + 
        "LEFT JOIN `%s` R ON R.property_id = P.id WHERE A.user_id = '%d';", 
        config.dbTblName.application, config.dbTblName.properties, config.dbTblName.property_photos, userId);
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


const deleteProc = (req, res, next) => {
    const params = req.body;
    const application_id = params.application_id;
    let sql = sprintfJs.sprintf("DELETE FROM `%s` WHERE `id` = '%d';", config.dbTblName.application, application_id);
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

const addGetProc = (req, res, next) => {
    const params = req.query;
    const id = params.id;
    const types = ['Piso', 'Casa', 'Oficina', 'Local'];
    const rooms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const baths = [1, 2, 3, 4, 5];
    const availableForms = ['10', '20', '30'];

    const styles = [
        '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
        'stylesheets/site/inquilinos/solicitudes/add.css',
        'vendors/fontawesome-free-5.9.0-web/css/all.css',
    ];
    const scripts = [
        'vendors/custom/dropzone/dropzone.js',
        'vendors/custom/sprintf.js/sprintf.min.js',
        'javascripts/site/inquilinos/solicitudes/add.js',
    ];
    if (!!id) {
        let sql = sprintfJs.sprintf("SELECT P.*, A.* FROM `%s` P LEFT JOIN `%s` A ON A.property_id = P.id  WHERE `id` = '%d';", dbTblName.properties, dbTblName.amenities, id);
        dbConn.query(sql, null, (error, result, fields) => {
            if (error) {
                res.status(500);

                // respond with html page
                if (req.accepts('html')) {
                    res.render('error/500', { baseUrl: config.server.adminBaseUrl });
                    return;
                }

                // respond with json
                if (req.accepts('json')) {
                    res.send({ error: 'Error desconocido' });
                    return;
                }

                // default to plain-text. send()
                res.type('txt').send('Error desconocido');
                return;
            }
            if (result.length === 0) {
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
            
            res.render('inquilinos/solicitudes/add', {
                userName: req.session.inquilinos.name,
                title: 'Nueva Anuncios',
                baseUrl: config.server.inquilinosBaseUrl,
                uri: 'anuncios',
                types,
                rooms,
                baths,
                method: 'put',
                data: result[0],
                availableForms,
                styles,
                scripts,
            });
        });
    } else {
        // console.log('alreadyLogin', req.session.inquilinos);
        res.render('inquilinos/solicitudes/add', {
            userName: req.session.inquilinos.name,
            title: 'Nueva Anuncio',
            baseUrl: config.server.inquilinosBaseUrl,
            uri: 'anuncios',
            types,
            rooms,
            baths,
            method: 'post',
            data: [],
            availableForms,
            styles,
            scripts,
        });
    }
};

const addSaveProc = (req, res, next) => {
    const method = req.method;
    // console.log('method', method);
    const params = req.body;
    const id = params.id;
    const name = params.name;
    const userId = req.session.inquilinos.id;
    const address = params.address;
    const type = params.type;
    const rooms = params.rooms;
    const baths = params.baths;
    const surface = params.surface;
    const monthlyPrice = params.monthlyPrice;
    const securityDeposit = params.securityDeposit;
    const description = params.description;
    const availableForm = params.availableForm;
    let freesolicitudesTrovit = params.freesolicitudesTrovit;

    freesolicitudesTrovit = !!freesolicitudesTrovit ? 1 : 0;

    let washer = params.washer;
    let gym = params.gym;
    let parkingSpot = params.parkingSpot;
    let airConditioning = params.airConditioning;
    let dishwasher = params.dishwasher;
    let storage = params.storage;
    let hardwoodFloors = params.hardwoodFloors;
    let balcony = params.balcony;
    let view = params.view;
    let studentFriendly = params.studentFriendly;
    let pool = params.pool;
    let elevator = params.elevator;
    let fireplace = params.fireplace;
    let doorman = params.doorman;
    let deck = params.deck;
    let wheelchairAccessible = params.wheelchairAccessible;
    let garden = params.garden;
    let furnished = params.furnished;
    let highRise = params.highRise;
    let utilitiesIncluded = params.utilitiesIncluded;

    washer = !!washer ? 1 : 0;
    gym = !!gym ? 1 : 0;
    parkingSpot = !!parkingSpot ? 1 : 0;
    airConditioning = !!airConditioning ? 1 : 0;
    dishwasher = !!dishwasher ? 1 : 0;
    storage = !!storage ? 1 : 0;
    hardwoodFloors = !!hardwoodFloors ? 1 : 0;
    balcony = !!balcony ? 1 : 0;
    view = !!view ? 1 : 0;
    studentFriendly = !!studentFriendly ? 1 : 0;
    pool = !!pool ? 1 : 0;
    elevator = !!elevator ? 1 : 0;
    fireplace = !!fireplace ? 1 : 0;
    doorman = !!doorman ? 1 : 0;
    deck = !!deck ? 1 : 0;
    wheelchairAccessible = !!wheelchairAccessible ? 1 : 0;
    garden = !!garden ? 1 : 0;
    furnished = !!furnished ? 1 : 0;
    highRise = !!highRise ? 1 : 0;
    utilitiesIncluded = !!utilitiesIncluded ? 1 : 0;

    const photo = params.photo;

    let sql;
    // if (method == 'POST') {
    //     sql = sprintfJs.sprintf("INSERT INTO `properties`(`name`, `address`, `type`, `rooms`, `baths`, `surface`, `price`, `accPrice`) VALUES('%s', '%s', '%s', %d, %d, %f, %f, %f);", name, address, type, rooms, baths, surface, price, accPrice);
    // } else if (method == 'PUT') {
        sql = sprintfJs.sprintf("UPDATE `%s` SET `userId` = '%d', `name` = '%s', `address` = '%s', `type` = '%s', `rooms` = '%d', `baths` = '%d', `surface` = '%f', `monthlyPrice` = '%f', `securityDeposit` = '%f', `description` = '%s', `availableForm` = '%s', `freesolicitudesTrovit` = '%d' WHERE `id` = '%d';", dbTblName.properties, userId, name, address, type, rooms, baths, surface, monthlyPrice, securityDeposit, description, availableForm, freesolicitudesTrovit, id);
    // }
    dbConn.query(sql, null, (error, results, fields) => {
        if (error) {
            console.log(error);
            res.status(200).send({
                result: 'error',
                message: 'Error desconocido',
            });
            return;
        }

        sql = sprintfJs.sprintf("INSERT INTO `%s`(`property_id`, `washer`, `gym`, `parkingSpot`, `airConditioning`, `dishwasher`, `storage`, `hardwoodFloors`, `balcony`, `view`, `studentFriendly`, `pool`, `elevator`, `fireplace`, `doorman`, `deck`, `wheelchairAccessible`, `garden`, `furnished`, `highRise`, `utilitiesIncluded`) VALUES('%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d') ON DUPLICATE KEY UPDATE `washer` = VALUES(`washer`), `gym` = VALUES(`gym`), `parkingSpot` = VALUES(`parkingSpot`), `airConditioning` = VALUES(`airConditioning`), `dishwasher` = VALUES(`dishwasher`), `storage` = VALUES(`storage`), `hardwoodFloors` = VALUES(`hardwoodFloors`), `balcony` = VALUES(`balcony`), `view` = VALUES(`view`), `studentFriendly` = VALUES(`studentFriendly`), `pool` = VALUES(`pool`), `elevator` = VALUES(`elevator`), `fireplace` = VALUES(`fireplace`), `doorman` = VALUES(`doorman`), `deck` = VALUES(`deck`), `wheelchairAccessible` = VALUES(`wheelchairAccessible`), `garden` = VALUES(`garden`), `furnished` = VALUES(`furnished`), `highRise` = VALUES(`highRise`), `utilitiesIncluded` = VALUES(`utilitiesIncluded`);", dbTblName.amenities, id, washer, gym, parkingSpot, airConditioning, dishwasher, storage, hardwoodFloors, balcony, view, studentFriendly, pool, elevator, fireplace, doorman, deck, wheelchairAccessible, garden, furnished, highRise, utilitiesIncluded);
        dbConn.query(sql, null, (error, results, fields) => {
            if (error) {
                console.log(error);
                res.status(200).send({
                    result: 'error',
                    message: 'Error desconocido',
                });
                return;
            }

            let photos = photo.join('*');

            sql = sprintfJs.sprintf("INSERT INTO `%s` (`property_id`, `fileNames`) VALUES ('%d', '%s') ON DUPLICATE KEY UPDATE `property_id` = VALUES(`property_id`), `fileNames` = VALUES(`fileNames`);", dbTblName.property_photos, id, photos);
            dbConn.query(sql, null, (error, result, fields) => {
                if (error) {
                    console.log(error);
                    res.status(200).send({
                        result: 'error',
                        message: 'Error desconocido',
                    });
                    return;
                }

                trovitXml.generateTrovitXml();

                res.status(200).send({
                    result: 'success',
                    message: 'Guardado correctamente',
                });
            });
        });
    });
};

const getPhotosProc = (req, res, next) => {
    const params = req.query;
    const property_id = params.id;

    let sql = sprintfJs.sprintf("SELECT `fileNames` FROM `%s` WHERE `property_id` = '%d';", dbTblName.property_photos, property_id);
    dbConn.query(sql, null, (error, result, fields) => {
        if (error) {
            console.log(error);
            res.status(200).send({
                result: 'error',
                data: [],
            });
        } else {
            let data = result;
            if (data.length === 0) {
                data = [];
            } else {
                data = data[0]['fileNames'].split('*');
            }
            res.status(200).send({
                result: 'success',
                data: data,
            });
        }
    });
};

const uploadPhotoProc = (req, res, next) => {
    if (Object.keys(req.files).length == 0) {
        return res.status(200).send({
            result: 'error',
            message: 'Not uploaded',
        });
    }

    const file = req.files.file;
    const extension = path.extname(file.name);
    const appDir = path.dirname(require.main.filename);
    const fileName = sprintfJs.sprintf('%s%s', uuid(), extension);
    const filePath = sprintfJs.sprintf('%s/../public/uploads/photo/%s', appDir, fileName);
    console.log(fileName, filePath);
    file.mv(filePath, function(err) {
        if (err) {
            return res.status(200).send({
                result: 'error',
                message: 'Not uploaded',
            });
        }

        return res.status(200).send({
            result: 'success',
            message: 'Uploaded',
            fileName: fileName,
        });
    });
};

const trovitXmlProc = () => {

};

router.get('/', indexProc);
router.get('/list', listProc);
router.delete('/delete', deleteProc);
router.get('/nueva', addGetProc);
// router.post('/add', addSaveProc);
router.put('/nueva', addSaveProc);
router.get('/photo', getPhotosProc);
router.post('/photo', uploadPhotoProc);

module.exports = router;
