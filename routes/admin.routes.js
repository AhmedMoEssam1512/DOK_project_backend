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

<<<<<<< HEAD
router.route('/pendingRegistrations')
    .get(auth.adminProtect, adminControllers.showPendingRegistration);

router.route('/verifyStudent/:studentEmail')
    .patch(auth.adminProtect, adminMiddleWare.studentFound, adminControllers.verifyStudent);

=======
router.route('/checkStudentInGroup/:group')
    .get(auth.adminProtect, adminControllers.showStudentInGroup);    
>>>>>>> eaab40b65399b84353833f790ef8ad2ae9e6b2fb

module.exports = router;