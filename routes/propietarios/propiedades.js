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

const addGetProc = (req, res, next) => {
    // console.log('alreadyLogin', req.session.propietarios);
    res.render('propietarios/propiedades/add', {
        userName: req.session.propietarios.name,
        title: 'Propiedades',
        baseUrl: config.server.propietariosBaseUrl,
        uri: 'propiedades/add',
        styles: [
            '//fonts.googleapis.com/css?family=Roboto:400,500&display=swap',
            'stylesheets/site/propietarios/propiedades/add.css',
        ],
        scripts: [
            'javascripts/site/propietarios/propiedades/add.js',
        ],
    })
};

router.get('/', indexProc);
router.get('/add', addGetProc);

module.exports = router;
