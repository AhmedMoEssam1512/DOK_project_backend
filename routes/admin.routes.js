const express = require('express');
const router = express.Router();
// const adminControllers = require('../controllers/admin.controllers');
// const adminMiddleWare = require('../middleware/admin.middleware');  
// const {protect, checkAuthorization} = require('../middleware/auth.middleware');
const DOK = require('../controllers/dok.controller.JS');

router.route('/DOK/signUp')
    .post(DOK.DOK_signUp);
 

module.exports = router;