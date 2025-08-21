const express = require('express');
const router = express.Router();
const dokmiddleware = require('../middleware/dok.middleware');
const DOK = require('../controllers/dok.controller.js');
const auth = require('../middleware/auth.middleware');

router.route('/signUp')
    .post(DOK.DOK_signUp);

router.route('/rejectAssistant/:email')
    .delete(auth.adminProtect, dokmiddleware.checkRole,dokmiddleware.findAdmin ,DOK.rejectAssistant);

router.route('/acceptAssistant/:email')
    .patch(auth.adminProtect, dokmiddleware.checkRole, dokmiddleware.findAdmin, DOK.acceptAssistant);

router.route('/showPendingAssistantRegistration')
    .get(auth.adminProtect, dokmiddleware.checkRole, DOK.showPendingRegistration);

router.route('/removeAssistant/:email')
    .delete(auth.adminProtect, dokmiddleware.checkRole, dokmiddleware.findAdmin, DOK.removeAssistant);

module.exports = router;