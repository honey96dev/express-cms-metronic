import express from 'express';
import config, {dbTblName} from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';
import path from 'path';
import uuid from 'uuid';

const router = express.Router();

const indexProc = (req, res, next) => {
    let search = req.query.search;
    let sort = req.query.sort;
    let page = req.query.page;
    
    if (sort == "" || sort == undefined)
        sort = "newest";
    
    if (page == "" || page == undefined)
        page = 1;

    if (search == "" || search == undefined)
        search = "";
    
    res.render('inquilinos/property/index', {
        userName: (req.session.inquilinos != undefined ? req.session.inquilinos.name : ""), // req.session.inquilinos.name,
        title: 'Index',
        baseUrl: config.server.inquilinosBaseUrl,
        uri: 'index',
        search: search,
        sort: sort,
        page: page,
        styles: [
            'stylesheets/site/inquilinos/property/index.css',
        ],
        scripts: [
            'javascripts/site/inquilinos/property/index.js',
        ],
    })
}

const listProc = (req, res, next) => {
    let search = req.query.search;
    let sort = req.query.sort;
    let page = req.query.page;
    let sql = "";
    if(search == "")
        sql = sprintfJs.sprintf("SELECT P.*, IFNULL(R.fileNames, '') `photos` FROM `%s` P LEFT JOIN `%s` R ON R.property_id = P.id", config.dbTblName.properties, config.dbTblName.property_photos);
    else
        sql = "SELECT P.*, IFNULL(R.fileNames, '') `photos` FROM `" + config.dbTblName.properties + "` P LEFT JOIN `" + config.dbTblName.property_photos + "` R ON R.property_id = P.id WHERE P.name like '%" + search + "%' OR P.address LIKE '%" + search + "%'";
    if(sort == "newest") {
        sql += " ORDER BY P.creationDate";
    }
    else if(sort == "bestmatch") {

    }
    else if(sort == "pricehigh") {
        sql += " ORDER BY P.price desc";
    }
    else if(sort == "pricelow") {
        sql += " ORDER BY P.price";
    }
    let start = (page - 1) * 10;
    sql += " LIMIT " + start + ", 10";
    dbConn.query(sql, null, (error, result, fields) => {
        if (error) {
            console.log(error);
            res.status(200).send({
                result: 'error',
                prev: "false",
                next: "false",
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
            prev: page > 1 ? "true" : "false",
            next: result.length < 10 ? "false" : "true",
            data: result,
        });
    });
};


function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
  
      const negativeSign = amount < 0 ? "-" : "";
  
      let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;
  
      return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
      console.log(e)
    }
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
            var numeral = require('numeral');
            result[0]["price"] = formatMoney(result[0]["price"], 0, ",", ".");
            
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

const applicationProc = (req, res, next) => {    
    const params = req.query;

    const app_id = params.app_id;

    let data = {
        id: app_id,
        home_id : params.id,
        user_id : req.session.inquilinos.id,
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
        let sql = sprintfJs.sprintf("select * from `%s` where id='%s'", dbTblName.application, app_id);

        dbConn.query(sql, null, (error, result, fields) => {
            if (error) {
                console.log(error);
                res.render('inquilinos/property/application', {
                    userName: (req.session.inquilinos != undefined ? req.session.inquilinos.name : ""), // req.session.inquilinos.name,
                    userEmail: (req.session.inquilinos != undefined ? req.session.inquilinos.email : ""), // req.session.inquilinos.name,
                    title: 'Index',
                    baseUrl: config.server.inquilinosBaseUrl,
                    uri: 'application',
                    data: data,
                    styles: [
                        //'vendors/custom/percentage-loader/css/documentation.css',
                        'stylesheets/site/inquilinos/property/application.css',
                    ],
                    scripts: [
                        'vendors/custom/percentage-loader/js/jquery.classyloader.min.js',
                        'javascripts/site/inquilinos/property/application.js',
                    ],
                });
                return;
            }
            if(result.length == 0) {
                res.render('inquilinos/property/application', {
                    userName: (req.session.inquilinos != undefined ? req.session.inquilinos.name : ""), // req.session.inquilinos.name,
                    userEmail: (req.session.inquilinos != undefined ? req.session.inquilinos.email : ""), // req.session.inquilinos.name,
                    title: 'Index',
                    baseUrl: config.server.inquilinosBaseUrl,
                    uri: 'application',
                    data: data,
                    styles: [
                        //'vendors/custom/percentage-loader/css/documentation.css',
                        'stylesheets/site/inquilinos/property/application.css',
                    ],
                    scripts: [
                        'vendors/custom/percentage-loader/js/jquery.classyloader.min.js',
                        'javascripts/site/inquilinos/property/application.js',
                    ],
                });
                return;
            }
            console.log(result);
            data.id = result[0].id;
            //data.home_id = result[0].home_id;
            data.user_id = result[0].user_id;
            data.user_email = result[0].user_email;
            data.user_phone = result[0].user_phone;
            data.employment_type = result[0].employment_type;
            data.employer_name = result[0].employer_name;
            data.employment_title = result[0].employment_title;
            data.monthly_income = result[0].monthly_income;
            data.rent = result[0].rent;
            data.family_income = result[0].family_income;
            data.monthly_rent = result[0].monthly_rent;
            data.security_deposite = result[0].security_deposite;
            data.rental_history_address = result[0].rental_history_address;
            data.rental_monthly_rent = result[0].rental_monthly_rent;
            data.contact_name = result[0].contact_name;
            data.contact_telephone = result[0].contact_telephone;
            data.contact_email = result[0].contact_email;
            data.reference_name = result[0].reference_name;
            data.reference_relationship = result[0].reference_relationship;
            data.reference_phone = result[0].reference_phone;
            data.reference_email = result[0].reference_email;
            data.cover_letter = result[0].cover_letter;

            let sql = sprintfJs.sprintf("select * from `%s` where application_id='%s'", dbTblName.application_documents, app_id);

            dbConn.query(sql, null, (error, result, fields) => {
                console.log(result);
                if(result.length > 0) {
                    data.documents_name = result[0].documents_name;
                    data.documents_path = result[0].documents_path;
                }
            });

            res.render('inquilinos/property/application', {
                userName: (req.session.inquilinos != undefined ? req.session.inquilinos.name : ""), // req.session.inquilinos.name,
                userEmail: (req.session.inquilinos != undefined ? req.session.inquilinos.email : ""), // req.session.inquilinos.name,
                title: 'Index',
                baseUrl: config.server.inquilinosBaseUrl,
                uri: 'application',
                data: data,
                styles: [
                    //'vendors/custom/percentage-loader/css/documentation.css',
                    'stylesheets/site/inquilinos/property/application.css',
                ],
                scripts: [
                    'vendors/custom/percentage-loader/js/jquery.classyloader.min.js',
                    'javascripts/site/inquilinos/property/application.js',
                ],
            });
            return;
        });
    }
    else {

        res.render('inquilinos/property/application', {
            userName: (req.session.inquilinos != undefined ? req.session.inquilinos.name : ""), // req.session.inquilinos.name,
            userEmail: (req.session.inquilinos != undefined ? req.session.inquilinos.email : ""), // req.session.inquilinos.name,
            title: 'Index',
            baseUrl: config.server.inquilinosBaseUrl,
            uri: 'application',
            data: data,
            styles: [
                //'vendors/custom/percentage-loader/css/documentation.css',
                'stylesheets/site/inquilinos/property/application.css',
            ],
            scripts: [
                'vendors/custom/percentage-loader/js/jquery.classyloader.min.js',
                'javascripts/site/inquilinos/property/application.js',
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
    const user_id = req.session.inquilinos.id;
    const user_email = req.session.inquilinos.email;
    const user_phone = paramsForm.user_phone;
    const employment_type = paramsForm.employment_type;
    const employer_name = paramsForm.employer_name;
    const employment_title = paramsForm.employment_title; 
    const monthly_income = paramsForm.monthly_income;
    const monthly_rent = paramsForm.monthly_rent;
    const security_deposite = paramsForm.security_deposite;
    const rental_history_address = paramsForm.rental_history_address;
    const rental_monthly_rent = paramsForm.rental_monthly_rent;
    const contact_name = paramsForm.contact_name;
    const contact_telephone = paramsForm.contact_telephone;
    const contact_email = paramsForm.contact_email;
    const reference_name = paramsForm.reference_name;
    const reference_relationship = paramsForm.reference_relationship;
    const reference_phone = paramsForm.reference_phone;
    const reference_email = paramsForm.reference_email;
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

const uploadPostProc = (req, res, next) => {    
    console.log(req.files);
    let file = req.files.file;

    const extension = path.extname(file.name);
    const appDir = path.dirname(require.main.filename);
    const fileName = sprintfJs.sprintf('%s%s', uuid(), extension);
    const filePath = sprintfJs.sprintf('%s/../public/uploads/application/%s', appDir, fileName);
    console.log(fileName, filePath);
    file.mv(filePath, function(err) {
        if (err) {
            return res.status(200).send({
                result: 'error',
                message: 'Not uploaded',
            });
        }

        return res.status(200).send({
            result: 'success',
            message: 'Uploaded',
            fileName: file.name,
            filePath: fileName,
        });
    });
}

function requiresLogin(req, res, next) {
    if (req.session && req.session.inquilinos && req.session.inquilinos.id) {
        return next();
    } else {
        res.redirect('/login');
    }
}

function alreadyLogin(req, res, next) {
    if (req.url === '/logout') {
        return next();
    }
    if (req.session && req.session.inquilinos && req.session.inquilinos.id) {
        res.redirect('/');
    } else {
        return next();
    }
}

router.get('/', indexProc);
router.get('/list', listProc);
router.get('/view', viewProc);
router.get('/application', requiresLogin, applicationProc);
router.put('/application', requiresLogin, applicationPostProc);
router.post('/upload', requiresLogin, uploadPostProc);

module.exports = router;
