import express from 'express';

const router = express.Router();

const indexProc = (req, res, next) => {
    res.status(200).send('OK');
};

router.get('/', indexProc);


module.exports = router;
