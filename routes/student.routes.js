const express = require('express');
const router = express.Router();
const studentControllers = require('../controllers/student.controller');
const studentMiddleWare = require('../middleware/student.middleware');

router.route('/studentRegister')
    .post(studentMiddleWare.studentFound,studentMiddleWare.passwordEncryption,studentControllers.studentRegister);

router.route('/studentLogin')
    .post(studentMiddleWare.findAndCheckStudent,studentControllers.signIn)

module.exports = router;