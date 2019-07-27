import express from 'express';
import config, {dbTblName} from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const indexProc = (req, res, next) => {
    res.render('inquilinos/property/index', {
        userName: (req.session.inquilinos != undefined ? req.session.inquilinos.name : ""), // req.session.inquilinos.name,
        title: 'Index',
        baseUrl: config.server.inquilinosBaseUrl,
        uri: 'index',
        styles: [
            'stylesheets/site/inquilinos/property/index.css',
        ],
        scripts: [
            'javascripts/site/inquilinos/property/index.js',
        ],
    })
}

const listProc = (req, res, next) => {
    let sql = sprintfJs.sprintf("SELECT P.*, IFNULL(R.fileNames, '') `photos` FROM `%s` P LEFT JOIN `%s` R ON R.property_id = P.id;", config.dbTblName.properties, config.dbTblName.property_photos);
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


const viewProc = (req, res, next) => {
    const params = req.query;
    const id = params.id;
    const types = ['Piso', 'Casa', 'Oficina', 'Local'];
    const rooms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const baths = [1, 2, 3, 4, 5];
    const availableForms = ['10', '20', '30'];

    const styles = [
        '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
        'stylesheets/site/inquilinos/property/view.css',
        'vendors/fontawesome-free-5.9.0-web/css/all.css',
    ];
    const scripts = [
        'vendors/custom/dropzone/dropzone.js',
        'vendors/custom/sprintf.js/sprintf.min.js',
        'javascripts/site/inquilinos/property/view.js',
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
            
            res.render('inquilinos/property/view', {
                userName: (req.session.inquilinos != undefined ? req.session.inquilinos.name : ""),
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
        res.render('inquilinos/property/view', {
            userName: (req.session.inquilinos != undefined ? req.session.inquilinos.name : ""),
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

router.get('/', indexProc);
router.get('/list', listProc);
router.get('/view', viewProc);

module.exports = router;
