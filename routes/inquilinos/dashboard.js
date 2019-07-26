import express from 'express';
import config from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const dashboardProc = (req, res, next) => {
    // console.log('alreadyLogin', req.session.inquilinos);
    res.render('inquilinos/dashboard', {
        userName: req.session.inquilinos.name,
        title: 'Dashboard',
        baseUrl: config.server.inquilinosBaseUrl,
        uri: 'dashboard',
        styles: [
            'stylesheets/site/inquilinos/dashboard.css',
        ],
        scripts: [
            'javascripts/site/inquilinos/dashboard.js',
        ],
    })
}

router.get('/', dashboardProc);

module.exports = router;
