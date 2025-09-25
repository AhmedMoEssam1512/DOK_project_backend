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

router.route('/student')
  .get(auth.studentProtect, submissionControllers.getStudentSubmissions);


router.route('/:submissionId')
  .get(auth.studentProtect,submissionMiddleware.subFound ,submissionControllers.getSubmissionById)
  .patch(auth.studentProtect, submissionMiddleware.subFound,submissionControllers.updateSubmission)
  .delete(auth.studentProtect, submissionMiddleware.subFound ,submissionControllers.deleteSubmission);

// Grade Assignment Submission
router.route('/assignment/:assignmentId/submissions/:submissionId/grade')
  .patch(auth.adminProtect, submissionControllers.gradeAssignmentSubmission);

// Grade Quiz Submission
router.route('/quiz/:quizId/submissions/:submissionId/grade')
  .patch(auth.adminProtect, submissionMiddleware.subFound , submissionControllers.gradeQuizSubmission);

// Get current student's quiz submission status
router.route('/quiz/:quizId/status')
  .get(auth.studentProtect, submissionControllers.getQuizSubmissionStatus);

module.exports = router;

