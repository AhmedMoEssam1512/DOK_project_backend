const express = require('express');
const router = express.Router();
const assignmentControllers = require('../controllers/assignment_controller');
const auth = require('../middleware/auth_middleware');
const assignmentMiddleware = require('../middleware/assignment_middleware');

// Assignment CRUD Operations
router.route('/')
  .post(auth.adminProtect, assignmentControllers.createAssignment)
  .get(auth.adminProtect, assignmentControllers.getAllAssignments);


router.route('/:assignmentId')
  .get(auth.adminProtect, assignmentMiddleware.assignExists, assignmentControllers.getAssignmentById)
  .patch(auth.adminProtect, assignmentMiddleware.assignExists, assignmentControllers.updateAssignment)
  .delete(auth.adminProtect, assignmentMiddleware.assignExists, assignmentControllers.deleteAssignment);

// Assignment Publishing Operations
router.route('/:assignmentId/publish')
  .patch(auth.adminProtect, assignmentMiddleware.assignExists, assignmentControllers.publishAssignment);


// Assignment Submissions

// Assignment Settings
router.route('/:assignmentId/toggle-late-submission')
  .patch(auth.adminProtect, assignmentMiddleware.assignExists, assignmentControllers.toggleLateSubmissionPolicy);

// Assignment Statistics

// Assignment Submission Status Functions

// Student Assignment Routes


module.exports = router;