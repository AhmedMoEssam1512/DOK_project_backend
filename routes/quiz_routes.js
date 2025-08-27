const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth_middleware');
const quizControllers = require('../controllers/quiz_controller');
const quizMiddleWare = require('../middleware/quiz_middleware');

router.route('/createQuiz')
    .post(auth.adminProtect, quizMiddleWare.checkFields, quizControllers.createQuiz);

router.route('/getAllQuizzes')
    .get(auth.protect,quizMiddleWare.getGroup ,quizControllers.getAllQuizzes);

module.exports = router;