import express from 'express';
import config from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const indexProc = (req, res, next) => {
    res.render('propietarios/documentos', {
        userName: req.session.propietarios.name,
        title: 'Documentos',
        baseUrl: config.server.propietariosBaseUrl,
        uri: 'documentos',
        styles: [
            // 'vendors/general/jquery-datatable/css/jquery.dataTables.css',
            // 'vendors/general/material-design-lite/material.css',
            // 'vendors/general/jquery-datatable/css/dataTables.material.css',
            'stylesheets/site/propietarios/documentos.css',
        ],
        scripts: [
            // 'vendors/general/jquery-datatable/js/jquery.dataTables.js',
            // 'vendors/general/jquery-datatable/js/dataTables.bootstrap4.js',
            'javascripts/site/propietarios/documentos.js',
        ],
    })
};

const listProc = (req, res, next) => {
    if (req.xhr) {
        let sql = sprintfJs.sprintf("SELECT * FROM `%s`;", config.dbTblName.documentos);

        dbConn.query(sql, null, (error, results, fields) => {
            if (error) {
                res.status(200).send({
                    result: 'error',
                    message: 'Error desconocido',
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

const addProc = (req, res, next) => {
    const params = req.body;
    const name = params.name;
    const description = params.description;
    const url = params.url;

    let sql = sprintfJs.sprintf("INSERT INTO `%s`(`name`, `description`, `url`) VALUES('%s', '%s', '%s');", config.dbTblName.documentos, name, description, url);
    dbConn.query(sql, null, (error, results, fields) => {
        if (error) {
            res.status(200).send({
                result: 'error',
                // message: 'Unknown error',
                message: 'Error desconocido',
                error: error,
            });
        } else {
            sql = sprintfJs.sprintf("SELECT * FROM `%s`;", config.dbTblName.documentos);
            dbConn.query(sql, null, (error, results1, fields) => {
                if (error) {
                    res.status(200).send({
                        result: 'success',
                        // message: 'Successfully saved',
                        message: 'Guardado correctamente',
                        data: [],
                        insertId: results.insertId,
                    });
                } else {
                    res.status(200).send({
                        result: 'success',
                        // message: 'Successfully saved',
                        message: 'Guardado correctamente',
                        data: results1,
                        insertId: results.insertId,
                    });
                }
            });
        }
    });
};
//
// const editProc = (req, res, next) => {
//     const params = req.body;
//     const documentId = params.documentId;
//     const name = params.name;
//     const description = params.description;
//     const url = params.url;
//
//     let sql = sprintfJs.sprintf("UPDATE `%s` SET `name` = '%s', `description` = '%s', `url` = '%s' WHERE `id` = '%s';", config.dbTblName.documentos, name, description, url, documentId);
//     dbConn.query(sql, null, (error, results, fields) => {
//         if (error) {
//             res.status(200).send({
//                 result: 'error',
//                 // message: 'Unknown error',
//                 message: 'Error desconocido',
//                 error: error,
//             });
//         } else {
//             sql = sprintfJs.sprintf("SELECT * FROM `%s`;", config.dbTblName.documentos);
//             dbConn.query(sql, null, (error, results1, fields) => {
//                 if (error) {
//                     res.status(200).send({
//                         result: 'success',
//                         // message: 'Successfully edited',
//                         message: 'Editado correctamente',
//                         data: [],
//                     });
//                 } else {
//                     res.status(200).send({
//                         result: 'success',
//                         // message: 'Successfully edited',
//                         message: 'Editado correctamente',
//                         data: results1,
//                     });
//                 }
//             });
//         }
//     });
// };
//
// const deleteProc = (req, res, next) => {
//     const params = req.body;
//     const documentId = params.documentId;
//
//     let sql = sprintfJs.sprintf("DELETE FROM `%s` WHERE `id` = '%d';", config.dbTblName.documentos, documentId);
//     dbConn.query(sql, null, (error, results, fields) => {
//         if (error) {
//             res.status(200).send({
//                 result: 'error',
//                 // message: 'Unknown error',
//                 message: 'Error desconocido',
//                 error: error,
//             });
//         } else {
//             sql = sprintfJs.sprintf("SELECT * FROM `%s`;", config.dbTblName.documentos);
//             dbConn.query(sql, null, (error, results1, fields) => {
//                 if (error) {
//                     res.status(200).send({
//                         result: 'success',
//                         // message: 'Successfully deleted',
//                         message: 'Eliminado correctamente',
//                         data: [],
//                     });
//                 } else {
//                     res.status(200).send({
//                         result: 'success',
//                         // message: 'Successfully deleted',
//                         message: 'Eliminado correctamente',
//                         data: results1,
//                     });
//                 }
//             });
//         }
//     });
// };

router.get('/', indexProc);

router.get('/list', listProc);

// router.post('/save', addProc);
//
// router.put('/save', editProc);
//
// router.delete('/save', deleteProc);

module.exports = router;
