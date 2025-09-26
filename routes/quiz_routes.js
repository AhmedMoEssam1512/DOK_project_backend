const express = require('express');
const router = express.Router();
const quizControllers = require('../controllers/quiz_controller');
const auth = require('../middleware/auth_middleware');
const quizMiddleware = require('../middleware/quiz_middleware');

// Quiz CRUD Operations
router.route('/')
  .post(auth.adminProtect, quizControllers.createQuiz)
  .get(auth.adminProtect, quizControllers.getAllQuizzes);

router.route('/:quizId')
  .get(auth.adminProtect, quizMiddleware.quizExists, quizControllers.getQuizById)
  .patch(auth.adminProtect, quizMiddleware.quizExists, quizControllers.updateQuiz)
  .delete(auth.adminProtect, quizMiddleware.quizExists, quizControllers.deleteQuiz);

// Quiz Publishing Operations
router.route('/:quizId/publish')
  .patch(auth.adminProtect, quizMiddleware.quizExists, quizControllers.publishQuiz);

module.exports = router;