const express = require('express');
const router = express.Router();
const dokmiddleware = require('../middleware/dok.middleware');
const DOK = require('../controllers/dok.controller.js');
const {protect} = require('../middleware/auth.middleware');

router.route('/signUp')
    .post(DOK.DOK_signUp);

router.route('/rejectAssistant/:email')
    .delete(protect, dokmiddleware.checkRole,dokmiddleware.findAdmin ,DOK.rejectAssistant);

router.route('/acceptAssistant/:email')
    .patch(protect, dokmiddleware.checkRole, dokmiddleware.findAdmin, DOK.acceptAssistant);

module.exports = router;