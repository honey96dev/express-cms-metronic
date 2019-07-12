import express from 'express';
import config from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const indexProc = (req, res, next) => {
    // console.log('alreadyLogin', req.session.propietarios);
    res.render('propietarios/listing/index', {
        userName: req.session.propietarios.name,
        title: 'Listing',
        baseUrl: config.server.propietariosBaseUrl,
        uri: 'anuncios',
        styles: [
            '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
            'stylesheets/site/propietarios/listing/index.css',
        ],
        scripts: [
            'javascripts/site/propietarios/listing/index.js',
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
    const availableForms = ['10', '20', '30'];
    let description = '';
    let freeListingProvit = '';

    const styles = [
        '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
        'stylesheets/site/propietarios/listing/add.css',
        'vendors/fontawesome-free-5.9.0-web/css/all.css',
    ];
    const scripts = [
        'vendors/custom/dropzone/dropzone.js',
        'javascripts/site/propietarios/listing/add.js',
    ];
    if (!!id) {
        let sql = sprintfJs.sprintf("SELECT P.* FROM `properties` P WHERE `id` = '%d';", id);
        dbConn.query(sql, null, (error, result, fields) => {
            if (error || result.length === 0) {
                error500(req, res, error);
                return;
            }
            res.render('propietarios/listing/add', {
                userName: req.session.propietarios.name,
                title: 'Listing',
                baseUrl: config.server.propietariosBaseUrl,
                uri: 'listing/add',
                types,
                rooms,
                baths,
                method: 'put',
                data: result[0],
                description,
                availableForms,
                freeListingProvit,
                styles,
                scripts,
            });
        });
    } else {
        // console.log('alreadyLogin', req.session.propietarios);
        res.render('propietarios/listing/add', {
            userName: req.session.propietarios.name,
            title: 'Listing',
            baseUrl: config.server.propietariosBaseUrl,
            uri: 'listing/add',
            types,
            rooms,
            baths,
            method: 'post',
            data: [],
            description,
            availableForms,
            freeListingProvit,
            styles,
            scripts,
        });
    }
};

const error404 = (req, res) => {
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
};

const error500 = (req, res, err) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);

    // respond with html page
    if (req.accepts('html')) {
        res.render('error/500', { baseUrl: config.server.propietariosBaseUrl });
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
};

const addSaveProc = (req, res, next) => {
    const method = req.method;
    // console.log('method', method);
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

const uploadPhotoProc = (req, res, next) => {
    res.status(200).send('ok');
};

router.get('/', indexProc);
router.get('/list', listProc);
router.get('/add', addGetProc);
router.post('/add', addSaveProc);
router.put('/add', addSaveProc);
router.post('/photo', uploadPhotoProc);

module.exports = router;
