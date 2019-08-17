import express from 'express';
import config, {dbTblName} from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const indexProc = (req, res, next) => {
    res.render('admin/interesados/index', {
        userName: req.session.admin.name,
        title: 'Lista de interesados',
        baseUrl: config.server.adminBaseUrl,
        uri: 'interesados',
        styles: [
            // 'vendors/general/jquery-datatable/css/jquery.dataTables.css',
            // 'vendors/general/jquery-datatable/css/dataTables.responsive.min.css',
            'vendors/general/material-design-lite/material.css',
            'vendors/general/jquery-datatable/css/dataTables.material.css',
            'stylesheets/site/admin/interesados/index.css',
        ],
        scripts: [
            // 'vendors/general/jquery-datatable/js/jquery.dataTables.js',
            'vendors/general/jquery-datatable/js/dataTables.responsive.min.js',
            'vendors/general/jquery-datatable/js/dataTables.bootstrap4.js',
            // 'vendors/general/jquery-datatable/js/dataTables.material.js',
            'javascripts/site/admin/interesados/index.js',
        ],
    })
};

const listProc = (req, res, next) => {
    //if (req.xhr) {
        let sql = sprintfJs.sprintf("select (SELECT @row_number := @row_number + 1) `num`, a.id, d.name as landlordname, b.`name`, a.user_email as email, a.user_phone as telephone, c.`name` as properties_name, c.creationDate as createdDate from `%s` a left join `%s` b on a.user_id=b.id left join `%s` c on a.home_id=c.id left join `%s` d on c.userId=d.id, (SELECT @row_number := -1) `N`;", config.dbTblName.application, config.dbTblName.propietarios, config.dbTblName.properties, config.dbTblName.propietarios);
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
        home_id : params.id,
        user_id : "",
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

    if(app_id != "")
    {
        console.log(app_id);
        let sql = sprintfJs.sprintf("select * from `%s` where id='%s'", dbTblName.application, app_id);

        dbConn.query(sql, null, (error, result, fields) => {
            if (error || result.length == 0) {
                console.log(error);
                res.render('admin/interesados/application', {
                    userName: (req.session.admin != undefined ? req.session.admin.name : ""), // req.session.inquilinos.name,
                    userEmail: (req.session.admin != undefined ? req.session.admin.email : ""), // req.session.inquilinos.name,
                    title: 'Index',
                    baseUrl: config.server.adminBaseUrl,
                    uri: 'application',
                    data: data,
                    employment_count: employment_count,
                    reference_count: reference_count,
                    styles: [
                        //'vendors/custom/percentage-loader/css/documentation.css',
                        'stylesheets/site/admin/interesados/application.css',
                    ],
                    scripts: [
                        'vendors/custom/percentage-loader/js/jquery.classyloader.min.js',
                        'javascripts/site/admin/interesados/application.js',
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
                    res.render('admin/interesados/application', {
                        userName: (req.session.admin != undefined ? req.session.admin.name : ""), // req.session.inquilinos.name,
                        userEmail: (req.session.admin != undefined ? req.session.admin.email : ""), // req.session.inquilinos.name,
                        title: 'Index',
                        baseUrl: config.server.adminBaseUrl,
                        uri: 'application',
                        data: data,
                        employment_count: employment_count,
                        reference_count: reference_count,
                        styles: [
                            //'vendors/custom/percentage-loader/css/documentation.css',
                            'stylesheets/site/admin/interesados/application.css',
                        ],
                        scripts: [
                            'vendors/custom/percentage-loader/js/jquery.classyloader.min.js',
                            'javascripts/site/admin/interesados/application.js',
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
                    res.render('admin/interesados/application', {
                        userName: (req.session.admin != undefined ? req.session.admin.name : ""), // req.session.inquilinos.name,
                        userEmail: (req.session.admin != undefined ? req.session.admin.email : ""), // req.session.inquilinos.name,
                        title: 'Index',
                        baseUrl: config.server.adminBaseUrl,
                        uri: 'application',
                        data: data,
                        employment_count: employment_count,
                        reference_count: reference_count,
                        styles: [
                            //'vendors/custom/percentage-loader/css/documentation.css',
                            'stylesheets/site/admin/interesados/application.css',
                        ],
                        scripts: [
                            'vendors/custom/percentage-loader/js/jquery.classyloader.min.js',
                            'javascripts/site/admin/interesados/application.js',
                        ],
                    });
                });
            });
        });
    }
    else {
        res.render('admin/interesados/application', {
            userName: (req.session.admin != undefined ? req.session.admin.name : ""), // req.session.inquilinos.name,
            userEmail: (req.session.admin != undefined ? req.session.admin.email : ""), // req.session.inquilinos.name,
            title: 'Index',
            baseUrl: config.server.adminBaseUrl,
            uri: 'application',
            data: data,
            employment_count: employment_count,
            reference_count: reference_count,
            styles: [
                //'vendors/custom/percentage-loader/css/documentation.css',
                'stylesheets/site/admin/interesados/application.css',
            ],
            scripts: [
                'vendors/custom/percentage-loader/js/jquery.classyloader.min.js',
                'javascripts/site/admin/interesados/application.js',
            ],
        });
    }
};


const applicationPostProc = (req, res, next) => {    
    const paramsQuery = req.query;
    const paramsForm = req.body;

    console.log(paramsQuery);
    console.log(paramsForm);
    const app_id = paramsForm.app_id;
    const home_id = paramsForm.home_id;
    const user_id = req.session.admin.id;
    const user_email = req.session.admin.email;
    const user_phone = paramsForm.user_phone;
    const employment_count = paramsForm.employment_count;
    const employer_name = Array.isArray(paramsForm["employer_name[]"]) ? paramsForm["employer_name[]"].join("#") : paramsForm["employer_name[]"];
    const employment_title = Array.isArray(paramsForm["employment_title[]"]) ? paramsForm["employment_title[]"].join("#") : paramsForm["employment_title[]"];
    const monthly_income = Array.isArray(paramsForm["monthly_income[]"]) ? paramsForm["monthly_income[]"].join("#") : paramsForm["monthly_income[]"];
    let employment_types = [];
    for(let i = 0; i < employment_count; i++)
        employment_types.push(paramsForm["employment_type" + i]);
    const employment_type = employment_types.join("#");

    const monthly_rent = paramsForm.monthly_rent;
    const security_deposite = paramsForm.security_deposite;
    const rental_history_address = paramsForm.rental_history_address;
    const rental_monthly_rent = paramsForm.rental_monthly_rent;
    const contact_name = paramsForm.contact_name;
    const contact_telephone = paramsForm.contact_telephone;
    const contact_email = paramsForm.contact_email;
    const reference_name = Array.isArray(paramsForm["reference_name[]"]) ? paramsForm["reference_name[]"].join("#") : paramsForm["reference_name[]"];
    const reference_relationship = Array.isArray(paramsForm["reference_relationship[]"]) ? paramsForm["reference_relationship[]"].join("#") : paramsForm["reference_relationship[]"];
    const reference_phone = Array.isArray(paramsForm["reference_phone[]"]) ? paramsForm["reference_phone[]"].join("#") : paramsForm["reference_phone[]"];
    const reference_email = Array.isArray(paramsForm["reference_email[]"]) ? paramsForm["reference_email[]"].join("#") : paramsForm["reference_email[]"];
    const cover_letter = paramsForm.cover_letter;
    const documents_name = paramsForm.documents_name;
    const documents_path = paramsForm.documents_path;
    const rent = "";
    const family_income  = "";
    if(app_id == "") {
        let sql = sprintfJs.sprintf("insert into `%s` (home_id,user_id,user_email,user_phone," +
            "employment_type,employer_name,employment_title,monthly_income,rent,family_income,monthly_rent," +
            "security_deposite,rental_history_address,rental_monthly_rent,contact_name,contact_telephone,contact_email," +
            "reference_name,reference_relationship,reference_phone,reference_email,cover_letter) " +
            "values ('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s')", 
            dbTblName.application, home_id,user_id,user_email,user_phone,
            employment_type,employer_name,employment_title,monthly_income,rent,family_income,monthly_rent,
            security_deposite,rental_history_address,rental_monthly_rent,contact_name,contact_telephone,contact_email,
            reference_name,reference_relationship,reference_phone,reference_email,cover_letter);

        dbConn.query(sql, null, (error, result, fields) => {
            if (error) {
                console.log(error);
                res.status(200).send({
                    result: 'error',
                    message: 'Error desconocido',
                });
                return;
            }

            let application_id = result.insertId;
            let sql = sprintfJs.sprintf("INSERT INTO `%s` (`application_id`, `documents_name`, `documents_path`) VALUES ('%d', '%s', '%s') " +
                " ON DUPLICATE KEY UPDATE `application_id` = VALUES(`application_id`), `documents_name` = VALUES(`documents_name`), `documents_path` = VALUES(`documents_path`);",
                dbTblName.application_documents, application_id, documents_name, documents_path);
            dbConn.query(sql, null, (error, result, fields) => { 
                if(error)
                    console.log(sql);
            });

            res.status(200).send({
                result: 'success',
                message: 'Guardado correctamente',
            });
        });
    } 
    else {
        let sql = sprintfJs.sprintf("update `%s` set home_id='%s',user_id='%s',user_email='%s',user_phone='%s'," +
            "employment_type='%s',employer_name='%s',employment_title='%s',monthly_income='%s',rent='%s',family_income='%s',monthly_rent='%s'," +
            "security_deposite='%s',rental_history_address='%s',rental_monthly_rent='%s',contact_name='%s',contact_telephone='%s',contact_email='%s'," +
            "reference_name='%s',reference_relationship='%s',reference_phone='%s',reference_email='%s',cover_letter='%s' where id='%s'", 
            dbTblName.application, home_id,user_id,user_email,user_phone,
            employment_type,employer_name,employment_title,monthly_income,rent,family_income,monthly_rent,
            security_deposite,rental_history_address,rental_monthly_rent,contact_name,contact_telephone,contact_email,
            reference_name,reference_relationship,reference_phone,reference_email,cover_letter, app_id);

        dbConn.query(sql, null, (error, result, fields) => {
            if (error) {
                console.log(error);
                res.status(200).send({
                    result: 'error',
                    message: 'Error desconocido',
                });
                return;
            }

            sql = sprintfJs.sprintf("INSERT INTO `%s` (`application_id`, `document_name`, `documents_path`) VALUES ('%d', '%s', '%s') " +
                " ON DUPLICATE KEY UPDATE `application_id` = VALUES(`application_id`), `document_name` = VALUES(`document_name`), `documents_path` = VALUES(`documents_path`);",
                dbTblName.application_documents, app_id, documents_name, documents_path);
            dbConn.query(sql, null, (error, result, fields) => { 
                
            });

            res.status(200).send({
                result: 'success',
                message: 'Guardado correctamente',
            });
        });
    }
};

router.get('/', indexProc);

router.get('/list', listProc);

router.delete('/delete', deleteProc);

router.get('/application', applicationProc);
router.put('/application', applicationPostProc);

module.exports = router;
