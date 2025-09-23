const express = require('express');
const router = express.Router();
const submissionControllers = require('../controllers/submission_controller');
const auth = require('../middleware/auth_middleware');

// Student Submission Routes
router.route('/quiz/:quizId')
  .post(auth.studentProtect, submissionControllers.submitQuiz);

router.route('/assignment/:assignmentId')
  .post(auth.studentProtect, submissionControllers.submitAssignment);

router.route('/student')
  .get(auth.studentProtect, submissionControllers.getStudentSubmissions);

router.route('/:submissionId')
  .get(auth.studentProtect, submissionControllers.getSubmissionById)
  .patch(auth.studentProtect, submissionControllers.updateSubmission)
  .delete(auth.studentProtect, submissionControllers.deleteSubmission);

// Admin Submission Routes

// Grade Assignment Submission
router.route('/assignment/:assignmentId/submissions/:submissionId/grade')
  .patch(auth.adminProtect, submissionControllers.gradeAssignmentSubmission);

module.exports = router;
