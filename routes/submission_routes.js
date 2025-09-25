const express = require('express');
const router = express.Router();
const submissionControllers = require('../controllers/submission_controller');
const auth = require('../middleware/auth_middleware');
const submissionMiddleware = require('../middleware/submission_middleware');

// Student Submission Routes
router.route('/quiz/:quizId')
  .post(
    auth.studentProtect,
    submissionMiddleware.quizExistsAndPublished,
    submissionMiddleware.checkQuizNotSubmitted,
    submissionMiddleware.checkQuizDueDate,
    submissionMiddleware.validateAttachment,
    submissionControllers.submitQuiz
  );

router.route('/assignment/:assignmentId')
  .post(
    auth.studentProtect,
    submissionMiddleware.assignmentExistsAndPublished,
    submissionMiddleware.checkAssignmentNotSubmitted,
    submissionMiddleware.checkAssignmentDueDate,
    submissionMiddleware.validateAttachment,
    submissionControllers.submitAssignment
  );


// Grade Submission
router.route('/gradeSubmission/:id')
  .patch(auth.adminProtect,submissionMiddleware.subExist, submissionMiddleware.canSeeSubmission ,submissionMiddleware.marked ,submissionControllers.gradeSubmission);

// // Get current student's quiz submission status
// router.route('/quiz/:quizId/status')
//   .get(auth.studentProtect, submissionControllers.getQuizSubmissionStatus);

module.exports = router;

