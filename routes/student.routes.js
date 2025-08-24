const express = require('express');
const router = express.Router();
const studentControllers = require('../controllers/student.controller');
const studentMiddleWare = require('../middleware/student.middleware');
const adminMiddleWare = require('../middleware/admin.middleware');

router.route('/studentRegister')
    .post(studentMiddleWare.studentFound,adminMiddleWare.passwordEncryption,studentControllers.studentRegister);

router.route('/studentLogin')
    .post(studentMiddleWare.findAndCheckStudent,studentControllers.signIn)

module.exports = router;