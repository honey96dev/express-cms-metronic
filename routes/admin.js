import express from 'express';
import loginRouter from './admin/login';
import dashboardRouter from './admin/dashboard';
import documentosRouter from './admin/documentos';
import propiedadesRouter from './admin/propiedades';
import listingRouter from './admin/listing';
import usersRouter from './admin/users';
import passwordRouter from './admin/password';
import interesadosRouter from './admin/interesados';
import config from "../core/config";

const router = express.Router();

function requiresLogin(req, res, next) {
    if (req.session && req.session.admin && req.session.admin.id) {
        return next();
    } else {
        res.redirect('/login');
    }
}

function alreadyLogin(req, res, next) {
    // console.log('alreadyLogin', req.url);
    if (req.url === '/logout') {
        return next();
    }
    if (req.session && req.session.admin && req.session.admin.id) {
        res.redirect('/');
    } else {
        return next();
    }
}

router.use('/password', alreadyLogin, passwordRouter);
router.use('/login', alreadyLogin, loginRouter);
router.use('/', requiresLogin, dashboardRouter);
router.use('/dashboard', requiresLogin, dashboardRouter);
router.use('/users', requiresLogin, usersRouter);
router.use('/documentos', requiresLogin, documentosRouter);
router.use('/propiedades', requiresLogin, propiedadesRouter);
router.use('/anuncios', requiresLogin, listingRouter);
router.use('/interesados', requiresLogin, interesadosRouter);

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
