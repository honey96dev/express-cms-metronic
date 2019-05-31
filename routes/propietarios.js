import express from 'express';
import registroRouter from './propietarios/registro';
import loginRouter from './propietarios/login';
import mainRouter from './propietarios/main';
import config from "../core/config";

const router = express.Router();

function requiresLogin(req, res, next) {
    if (req.session && req.session.propietarios && req.session.propietarios.id) {
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
    if (req.session && req.session.propietarios && req.session.propietarios.id) {
        res.redirect('/');
    } else {
        return next();
    }
}


router.use('/registro', alreadyLogin, registroRouter);
router.use('/login', alreadyLogin, loginRouter);
router.use('/', requiresLogin, mainRouter);

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
