import express from 'express';
import config from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const dashboardProc = (req, res, next) => {
    res.render('admin/dashboard', {
        title: 'Dashboard',
        baseUrl: config.server.adminBaseUrl,
        uri: 'dashboard',
        styles: [
            'stylesheets/site/admin/dashboard.css',
        ],
        scripts: [
            'javascripts/site/admin/dashboard.js',
        ],
    })
}

router.get('/', dashboardProc);

module.exports = router;