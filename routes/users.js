import express from 'express';
const router = express.Router();

const loginProc = (req, res, next) => {
  res.render('users/login');
};

router.all('/', loginProc);

router.all('/login', loginProc);

router.all('/signup', () => {

});

module.exports = router;
