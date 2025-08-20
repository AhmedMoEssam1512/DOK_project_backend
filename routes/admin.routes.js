const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/admin.controller');
const adminMiddleWare = require('../middleware/admin.middleware');

router.route('/adminRegister')
    .post(adminMiddleWare.adminFound,adminMiddleWare.passwordEncryption,adminControllers.TARegister);

router.route('/adminLogin')
    .post(adminMiddleWare.findAndCheckAdmin, adminControllers.signIn);

module.exports = router;