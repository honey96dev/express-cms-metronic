import express from 'express';
import config from '../config/config';

const router = express.Router();

const loginProc = (req, res, next) => {
  res.render('users/login', {baseUrl: config.baseUrl});
};

const signupProc = (req, res, next) => {
  res.render('users/signup', {baseUrl: config.baseUrl});
};

router.all('/', loginProc);

router.all('/login', loginProc);

router.all('/signup', signupProc);

module.exports = router;
