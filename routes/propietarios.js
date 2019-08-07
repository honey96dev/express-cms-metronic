import express from 'express';
import config from "../core/config";
import registroRouter from './propietarios/registro';
import loginRouter from './propietarios/login';
import dashboardRouter from "./propietarios/dashboard";
import propiedadesRouter from "./propietarios/propiedades";
import listingRouter from "./propietarios/listing";
import documentosRouter from "./propietarios/documentos";
import passwordRouter from "./propietarios/password";
import interesadosRouter from "./propietarios/interesados";
import trovitXml from "../core/trovitXml";

const router = express.Router();

function requiresLogin(req, res, next) {
    if (req.session && req.session.propietarios && req.session.propietarios.id) {
        return next();
    } else {
        res.redirect('/login');
    }
}

function alreadyLogin(req, res, next) {
    if (req.url === '/logout') {
        return next();
    }
    if (req.session && req.session.propietarios && req.session.propietarios.id) {
        res.redirect('/');
    } else {
        return next();
    }
}

router.use('/password', alreadyLogin, passwordRouter);
router.use('/registro', alreadyLogin, registroRouter);
router.use('/login', alreadyLogin, loginRouter);
router.use('/wp_feed.xml', wpfeedFunc);
router.use('/', requiresLogin, dashboardRouter);
router.use('/dashboard', requiresLogin, dashboardRouter);
router.use('/propiedades', requiresLogin, propiedadesRouter);
router.use('/anuncios', requiresLogin, listingRouter);
router.use('/documentos', requiresLogin, documentosRouter);
router.use('/interesados', requiresLogin, interesadosRouter);

function wpfeedFunc(req, res, next) {
    return trovitXml.generateTrovitXml((xml) => {
        res.status(200).send(xml);
    });
}

router.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('error/404', { baseUrl: config.server.propietariosBaseUrl });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

module.exports = router;
