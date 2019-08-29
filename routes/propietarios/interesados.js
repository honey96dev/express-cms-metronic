import express from 'express';
import config,{dbTblName} from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const indexProc = (req, res, next) => {
    res.render('propietarios/interesados/index', {
        userName: req.session.propietarios.name,
        title: 'Lista de interesados',
        baseUrl: config.server.propietariosBaseUrl,
        uri: 'interesados',
        styles: [
            // 'vendors/general/jquery-datatable/css/jquery.dataTables.css',
            // 'vendors/general/jquery-datatable/css/dataTables.responsive.min.css',
            'vendors/general/material-design-lite/material.css',
            'vendors/general/jquery-datatable/css/dataTables.material.css',
            'stylesheets/site/propietarios/interesados/index.css',
        ],
        scripts: [
            // 'vendors/general/jquery-datatable/js/jquery.dataTables.js',
            'vendors/general/jquery-datatable/js/dataTables.responsive.min.js',
            'vendors/general/jquery-datatable/js/dataTables.bootstrap4.js',
            // 'vendors/general/jquery-datatable/js/dataTables.material.js',
            'javascripts/site/propietarios/interesados/index.js',
        ],
    })
};

const listProc = (req, res, next) => {
    //if (req.xhr) {
        let sql = sprintfJs.sprintf("select (SELECT @row_number := @row_number + 1) `num`, a.id, b.`name`, a.user_email as email, a.user_phone as telephone, c.`name` as properties_name, c.creationDate as createdDate from `%s` a left join `%s` b on a.user_id=b.id left join `%s` c on a.home_id=c.id, (SELECT @row_number := -1) `N`;", config.dbTblName.application, config.dbTblName.propietarios, config.dbTblName.properties);
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
    //} else {
    //    res.redirect(404);
    //}
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

    let sql = sprintfJs.sprintf("DELETE FROM `%s` WHERE `id` = '%d';", config.dbTblName.application, accountId);
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

const applicationProc = (req, res, next) => {    
    const params = req.query;

    const app_id = params.app_id;
    let employment_count = 1;
    let reference_count = 1;

    let data = {
        id: app_id,
        home_id : "",
        precio: "0",
        fianza: "0",
        user_id : req.session.propietarios.id,
        user_email : "",
        user_phone : "",
        employment_type : "",
        employer_name : "",
        employment_title : "",
        monthly_income : "",
        monthly_rent : "",
        security_deposite : "",
        rental_history_address : "",
        rental_monthly_rent : "",
        contact_name : "",
        contact_telephone : "",
        contact_email : "",
        reference_name : "",
        reference_relationship : "",
        reference_phone : "",
        reference_email : "",
        cover_letter : "",
        rent : "",
        family_income : "",
        documents_path : "",
        documents_name : "",
    };

    if(app_id != "" && app_id != undefined)
    {
        console.log(app_id);
        let sql = sprintfJs.sprintf("select * from `%s` where id='%s'", dbTblName.application, app_id);

        dbConn.query(sql, null, (error, result, fields) => {
            if (error || result.length == 0) {
                console.log(error);
                res.render('propietarios/interesados/application', {
                    userName: (req.session.propietarios != undefined ? req.session.propietarios.name : ""), // req.session.inquilinos.name,
                    userEmail: (req.session.propietarios != undefined ? req.session.propietarios.email : ""), // req.session.inquilinos.name,
                    title: 'Index',
                    baseUrl: config.server.propietariosBaseUrl,
                    employment_count: employment_count,
                    reference_count: reference_count,
                    uri: 'application',
                    data: data,
                    styles: [
                        //'vendors/custom/percentage-loader/css/documentation.css',
                        'stylesheets/site/propietarios/interesados/application.css',
                    ],
                    scripts: [
                        'vendors/custom/percentage-loader/js/jquery.classyloader.min.js',
                        'javascripts/site/propietarios/interesados/application.js',
                    ],
                });
                return;
            }
            
            data.id = result[0].id;
            data.home_id = result[0].home_id;
            data.user_id = result[0].user_id;
            data.user_email = result[0].user_email;
            data.user_phone = result[0].user_phone;
            data.employment_type = result[0].employment_type.split("#");
            employment_count = data.employment_type.length;
            data.employer_name = result[0].employer_name.split("#");
            data.employment_title = result[0].employment_title.split("#");
            data.monthly_income = result[0].monthly_income.split("#");
            data.rent = result[0].rent;
            data.family_income = result[0].family_income;
            data.monthly_rent = result[0].monthly_rent;
            data.security_deposite = result[0].security_deposite;
            data.rental_history_address = result[0].rental_history_address;
            data.rental_monthly_rent = result[0].rental_monthly_rent;
            data.contact_name = result[0].contact_name;
            data.contact_telephone = result[0].contact_telephone;
            data.contact_email = result[0].contact_email;
            data.reference_name = result[0].reference_name.split("#");
            data.reference_relationship = result[0].reference_relationship.split("#");
            data.reference_phone = result[0].reference_phone.split("#");
            data.reference_email = result[0].reference_email.split("#");
            reference_count = data.reference_name.length;
            data.cover_letter = result[0].cover_letter;
            
            let sql = sprintfJs.sprintf("select * from `%s` where id='%s'", dbTblName.properties, result[0].home_id);
            dbConn.query(sql, null, (error, propResult, fields) => {
                if (error || propResult.length == 0) {
                    res.render('propietarios/interesados/application', {
                        userName: (req.session.propietarios != undefined ? req.session.propietarios.name : ""), // req.session.inquilinos.name,
                        userEmail: (req.session.propietarios != undefined ? req.session.propietarios.email : ""), // req.session.inquilinos.name,
                        title: 'Index',
                        baseUrl: config.server.propietariosBaseUrl,
                        employment_count: employment_count,
                        reference_count: reference_count,
                        uri: 'application',
                        data: data,
                        styles: [
                            //'vendors/custom/percentage-loader/css/documentation.css',
                            'stylesheets/site/propietarios/interesados/application.css',
                        ],
                        scripts: [
                            'vendors/custom/percentage-loader/js/jquery.classyloader.min.js',
                            'javascripts/site/propietarios/interesados/application.js',
                        ],
                    });
                }

                data.precio = propResult[0].monthlyPrice;
                data.fianza = propResult[0].securityDeposit;

                let sql = sprintfJs.sprintf("select * from `%s` where application_id='%s'", dbTblName.application_documents, app_id);

                dbConn.query(sql, null, (error, result, fields) => {
                    console.log(result);
                    if(result.length > 0) {
                        data.documents_name = result[0].documents_name;
                        data.documents_path = result[0].documents_path;
                    }
                    console.log(data);
                    res.render('propietarios/interesados/application', {
                        userName: (req.session.propietarios != undefined ? req.session.propietarios.name : ""), // req.session.inquilinos.name,
                        userEmail: (req.session.propietarios != undefined ? req.session.propietarios.email : ""), // req.session.inquilinos.name,
                        title: 'Interesados - Alquilerista',
                        baseUrl: config.server.propietariosBaseUrl,
                        employment_count: employment_count,
                        reference_count: reference_count,
                        uri: 'application',
                        data: data,
                        styles: [
                            //'vendors/custom/percentage-loader/css/documentation.css',
                            'stylesheets/site/propietarios/interesados/application.css',
                        ],
                        scripts: [
                            'vendors/custom/percentage-loader/js/jquery.classyloader.min.js',
                            'javascripts/site/propietarios/interesados/application.js',
                        ],
                    });
                });
            });
        });
    }
    else {
        res.render('propietarios/interesados/application', {
            userName: (req.session.propietarios != undefined ? req.session.propietarios.name : ""), // req.session.inquilinos.name,
            userEmail: (req.session.propietarios != undefined ? req.session.propietarios.email : ""), // req.session.inquilinos.name,
            title: 'Index',
            baseUrl: config.server.propietariosBaseUrl,
            employment_count: employment_count,
            reference_count: reference_count,
            uri: 'application',
            data: data,
            styles: [
                //'vendors/custom/percentage-loader/css/documentation.css',
                'stylesheets/site/propietarios/interesados/application.css',
            ],
            scripts: [
                'vendors/custom/percentage-loader/js/jquery.classyloader.min.js',
                'javascripts/site/propietarios/interesados/application.js',
            ],
        });
    }
};

router.get('/', indexProc);

router.get('/list', listProc);

router.delete('/delete', deleteProc);

router.get('/application', applicationProc);

module.exports = router;
