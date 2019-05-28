import express from 'express';
import config from '../core/config';
import dbConn from '../core/dbConn';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const dashboardProc = (req, res, next) => {
    res.render('admin/dashboard', {
        baseUrl: config.server.baseUrl,
        uri: 'admin/dashboard',
        styles: [
            'stylesheets/site/admin/dashboard.css',
        ],
        scripts: [
            'javascripts/site/admin/dashboard.js',
        ],
    })
}

router.get('/', dashboardProc);

router.get('/dashboard', dashboardProc);

router.get('/users', (req, res, next) => {
    res.render('admin/users', {
        title: 'Lista de Usuarios',
        baseUrl: config.server.baseUrl,
        uri: 'admin/users',
        styles: [
            // 'vendors/general/jquery-datatable/css/jquery.dataTables.css',
            'vendors/general/material-design-lite/material.css',
            'vendors/general/jquery-datatable/css/dataTables.material.css',
            'stylesheets/site/admin/users.css',
        ],
        scripts: [
            'vendors/general/jquery-datatable/js/jquery.dataTables.js',
            'vendors/general/jquery-datatable/js/dataTables.bootstrap4.js',
            'javascripts/site/admin/users.js',
        ],
    })
});

router.get('/users/list', (req, res, next) => {
    let sql = sprintfJs.sprintf("SELECT * FROM `users`;");

    dbConn.query(sql, null, (error, results, fields) => {
        if (error) {
            res.status(200).send({
                result: 'error',
                message: 'Unknown error',
                data: [],
            });
            return;
        } else {
            res.status(200).send({
                result: 'success',
                data: results,
            });
        }
    });
});

module.exports = router;
