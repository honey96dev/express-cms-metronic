import express from 'express';
import config, {dbTblName} from '../../core/config';
import dbConn from '../../core/dbConn';
import sprintfJs from 'sprintf-js';

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
    res.render('inquilinos/property/application', {
        userName: (req.session.inquilinos != undefined ? req.session.inquilinos.name : ""), // req.session.inquilinos.name,
        title: 'Index',
        baseUrl: config.server.inquilinosBaseUrl,
        uri: 'application',
        styles: [
            'stylesheets/site/inquilinos/property/application.css',
        ],
        scripts: [
            'javascripts/site/inquilinos/property/application.js',
        ],
    })
};

router.get('/', indexProc);
router.get('/list', listProc);
router.get('/view', viewProc);
router.get('/application', applicationProc);

module.exports = router;
