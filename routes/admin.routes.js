const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/admin.controller');
const adminMiddleWare = require('../middleware/admin.middleware');
const DOK = require('../controllers/dok.controller.JS');

router.route('/DOK/signUp')
    .post(DOK.DOK_signUp);

router.route('/adminRegister')
    .post(adminMiddleWare.adminFound,adminMiddleWare.passwordEncryption,adminControllers.TARegister);

module.exports = router;