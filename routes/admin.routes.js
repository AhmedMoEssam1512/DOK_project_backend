const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const adminControllers = require('../controllers/admin.controller');
const adminMiddleWare = require('../middleware/admin.middleware');

router.route('/adminRegister')
    .post(adminMiddleWare.adminFound,adminMiddleWare.passwordEncryption,adminControllers.TARegister);

router.route('/adminLogin')
    .post(adminMiddleWare.findAndCheckAdmin, adminControllers.signIn);

router.route('/adminSSE')
    .get(auth.adminProtect, adminMiddleWare.establishConnection);

module.exports = router;