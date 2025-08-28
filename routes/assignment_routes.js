const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth_middleware');
const assignControllers = require('../controllers/assignment_controller');
const assignMiddleWare = require('../middleware/assignment_middleware');
const quizMiddleware = require('../middleware/quiz_middleware');

router.route('/createAssignment')
    .post(auth.adminProtect, assignMiddleWare.checkField, assignControllers.createAssignment)

router.route('/getAllAssignments')
    .get(auth.protect, quizMiddleware.getGroup, assignControllers.getAllAssignments)

module.exports = router;