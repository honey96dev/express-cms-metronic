import express from 'express';
import config from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const indexProc = (req, res, next) => {
    res.render('admin/users', {
        userName: req.session.admin.name,
        title: 'Lista de Usuarios',
        baseUrl: config.server.adminBaseUrl,
        uri: 'users',
        styles: [
            // 'vendors/general/jquery-datatable/css/jquery.dataTables.css',
            // 'vendors/general/jquery-datatable/css/dataTables.responsive.min.css',
            'vendors/general/material-design-lite/material.css',
            'vendors/general/jquery-datatable/css/dataTables.material.css',
            'stylesheets/site/admin/users.css',
        ],
        scripts: [
            // 'vendors/general/jquery-datatable/js/jquery.dataTables.js',
            'vendors/general/jquery-datatable/js/dataTables.responsive.min.js',
            'vendors/general/jquery-datatable/js/dataTables.bootstrap4.js',
            // 'vendors/general/jquery-datatable/js/dataTables.material.js',
            'javascripts/site/admin/users.js',
        ],
    })
};

const listProc = (req, res, next) => {
    if (req.xhr) {
        let sql = sprintfJs.sprintf("SELECT (SELECT @row_number := @row_number + 1) `num`, U.* FROM `%s` U, (SELECT @row_number := -1) `N`;", config.dbTblName.propietarios);
        // let sql = sprintfJs.sprintf("SELECT * FROM `%s`;", config.dbTblName.propietarios);

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
    } else {
        res.redirect(404);
    }
};

const editProc = (req, res, next) => {
    const params = req.body;
    const userId = params.userId;
    const name = params.name;
    const email = params.email;
    const telephone = params.telephone ? params.telephone : '';

    let sql = sprintfJs.sprintf("UPDATE `%s` SET `name` = '%s', `email` = '%s', `telephone` = '%s' WHERE `id` = '%s';", config.dbTblName.propietarios, name, email, telephone, userId);
    dbConn.query(sql, undefined, (error, results, fields) => {
        if (error) {
            res.status(200).send({
                data: [],
            });
            return;
        }
        sql = sprintfJs.sprintf("SELECT (SELECT @row_number := @row_number + 1) `num`, U.* FROM `%s` U, (SELECT @row_number := -1) `N`;", config.dbTblName.propietarios);
        // let sql = sprintfJs.sprintf("SELECT * FROM `%s`;", config.dbTblName.propietarios);

        dbConn.query(sql, null, (error, results, fields) => {
            if (error) {
                res.status(200).send({
                    result: 'error',
                    message: 'Unknown error',
                    data: [],
                });
            } else {
                res.status(200).send({
                    result: 'success',
                    data: results,
                });
            }
        });
    });
};

const deleteProc = (req, res, next) => {
    const params = req.body;
    const accountId = params.accountId;

    let sql = sprintfJs.sprintf("DELETE FROM `%s` WHERE `id` = '%d';", config.dbTblName.propietarios, accountId);
    dbConn.query(sql, null, (error, results, fields) => {
        if (error) {
            res.status(200).send({
                result: 'error',
                message: 'Unknown error',
                error: error,
            });
        } else {
            res.status(200).send({
                result: 'success',
                message: 'Successfully deleted',
            });
        }
    });
};

router.get('/', indexProc);

router.get('/list', listProc);

router.put('/save', editProc);

router.delete('/delete', deleteProc);

module.exports = router;
