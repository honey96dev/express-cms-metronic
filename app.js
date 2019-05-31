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
// import indexRouter from './routes/index';
// import usersRouter from './routes/users';
// import adminRouter from './routes/admin';
import propietariosRouter from './routes/propietarios';
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

app.use(function (req, res, next) {
    if (req.secure) {
        // request was via https, so do no special handling
        next();
    } else {
        // request was via http, so redirect to https
        res.redirect('https://' + req.headers.host + req.url);
    }
});

app.use(subdomain('propietarios', propietariosRouter));
app.use(subdomain('admin', adminRouter));

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
