import express from 'express';
import config from "../core/config";
import registroRouter from './inquilinos/registro';
import loginRouter from './inquilinos/login';
import dashboardRouter from "./inquilinos/dashboard";
import propiedadesRouter from "./inquilinos/propiedades";
import listingRouter from "./inquilinos/listing";
import documentosRouter from "./inquilinos/documentos";
import passwordRouter from "./inquilinos/password";
import propertyRouter from "./inquilinos/property";

const router = express.Router();

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

router.use('/password', passwordRouter);
router.use('/registro', registroRouter);
router.use('/login', loginRouter);
router.use('/', dashboardRouter);
router.use('/dashboard', dashboardRouter);
router.use('/propiedades', propiedadesRouter);
router.use('/anuncios', listingRouter);
router.use('/documentos', documentosRouter);
router.use('/property', propertyRouter);

router.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('error/404', { baseUrl: config.server.inquilinosBaseUrl });
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
