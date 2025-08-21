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

router.route('/pendingRegistrations')
    .get(auth.adminProtect, adminControllers.showPendingRegistration);

router.route('/verifyStudent/:studentEmail')
    .patch(auth.adminProtect, adminMiddleWare.studentFound, adminControllers.verifyStudent);

router.route('/rejectStudent/:studentEmail')
    .patch(auth.adminProtect, adminMiddleWare.studentFound, adminControllers.rejectSudent);

router.route('/checkStudentInGroup/:group')
    .get(auth.adminProtect, adminControllers.showStudentInGroup);   
    
router.route('/removeStudent/:studentEmail')
    .delete(auth.adminProtect, adminMiddleWare.checkAuthurity, adminControllers.removeStudent);

router.route('/banStudent/:studentEmail')
    .patch(auth.adminProtect, adminMiddleWare.checkAuthurity, adminControllers.banStudent);

router.route('/unBanStudent/:studentEmail')
    .patch(auth.adminProtect, adminMiddleWare.checkAuthurity, adminControllers.unBanStudent);

module.exports = router;