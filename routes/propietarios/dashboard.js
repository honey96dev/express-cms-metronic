import express from 'express';
import config from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const dashboardProc = (req, res, next) => {
    console.log('alreadyLogin', req.session.propietarios);
    res.render('propietarios/dashboard', {
        userName: req.session.propietarios.name,
        title: 'Dashboard',
        baseUrl: config.server.propietariosBaseUrl,
        uri: 'dashboard',
        styles: [
            'stylesheets/site/propietarios/dashboard.css',
        ],
        scripts: [
            'javascripts/site/propietarios/dashboard.js',
        ],
    })
}

router.get('/', dashboardProc);

module.exports = router;
