import express from 'express';
// import expressJwt from 'express-jwt';
import session from 'express-session';
import expressMysqlSessionLib from 'express-mysql-session';
import subdomain from 'express-subdomain';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import config from './core/config';
import indexRouter from './routes/index';
import usersRouter from './routes/users';
import adminRouter from './routes/admin';

const app = express();
const MySQLStore = expressMysqlSessionLib(session);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(cors());
app.use(cookieParser());
app.use(session({
    key: config.session.key,
    secret: config.session.secret,
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore(config.mysql),
}));
// app.use('/api', expressJwt({secret: core.session.secret})
//     .unless({
//         path: [
//             '/users/login',
//             '/users/signup',
//         ]
//     }));

function requiresLogin(req, res, next) {
    if (req.session && req.session.user && req.session.user.id) {
        return next();
    } else {
        res.redirect('/users');
    }
}

function alreadyLogin(req, res, next) {
    // console.log('alreadyLogin', req.url);
    if (req.url === '/logout') {
        return next();
    }
    if (req.session && req.session.user && req.session.user.id) {
        res.redirect('/');
    } else {
        return next();
    }
}
app.use(function (req, res, next) {
    if (req.secure) {
        // request was via https, so do no special handling
        next();
    } else {
        // request was via http, so redirect to https
        res.redirect('https://' + req.headers.host + req.url);
    }
});

// app.use('/users', alreadyLogin, usersRouter);
// app.use('/admin', requiresLogin, adminRouter);
// app.use('/', requiresLogin, indexRouter);
app.use('/registro', alreadyLogin, usersRouter);
app.use('/users', alreadyLogin, usersRouter);
// app.use(subdomain('/registro'));
app.use('/admin', requiresLogin, adminRouter);
app.use('/', requiresLogin, indexRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     next(createError(404));
// });

app.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('error/404', { baseUrl: config.server.baseUrl });
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

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
