const express = require('express');
const router = express.Router();
const dokmiddleware = require('../middleware/dok.middleware');
const DOK = require('../controllers/dok.controller.JS');

router.route('/signUp')
    .post(DOK.DOK_signUp);

module.exports = router;