const asyncWrapper = require('./asyncwrapper');
const AppError = require('../utils/app.error');
const { Submission, Quiz, Assignment } = require('../models');

// Check if quiz exists and is published
const quizExistsAndPublished = asyncWrapper(async (req, res, next) => {
  const { quizId } = req.params;
  
  const quiz = await Quiz.findOne({
    where: { quizId, isActive: true, isPublished: true }
  });
  
  if (!quiz) {
    return next(new AppError('Quiz not found or not published', 404));
  }
  
  req.quiz = quiz;
  next();
});

// Check if assignment exists and is published
const assignmentExistsAndPublished = asyncWrapper(async (req, res, next) => {
  const { assignmentId } = req.params;
  
  const assignment = await Assignment.findOne({
    where: { assignmentId, isActive: true, isPublished: true }
  });
  
  if (!assignment) {
    return next(new AppError('Assignment not found or not published', 404));
  }
  
  req.assignment = assignment;
  next();
});

// Check if student has NOT already submitted quiz
const checkQuizNotSubmitted = asyncWrapper(async (req, res, next) => {
  const { quizId } = req.params;
  const studentId = req.student.id;
  
  const existingSubmission = await Submission.findOne({
    where: { 
      studentId, 
      quizId,
      type: 'quiz'
    }
  });
  
  if (existingSubmission) {
    return next(new AppError('You have already submitted this quiz', 400));
  }
  
  next();
});

// Check if student has NOT already submitted assignment
const checkAssignmentNotSubmitted = asyncWrapper(async (req, res, next) => {
  const { assignmentId } = req.params;
  const studentId = req.student.id;
  
  const existingSubmission = await Submission.findOne({
    where: { 
      studentId, 
      assId: assignmentId,
      type: 'assignment'
    }
  });
  
  if (existingSubmission) {
    return next(new AppError('You have already submitted this assignment', 400));
  }
  
  next();
});

// Check due date for quiz
const checkQuizDueDate = asyncWrapper(async (req, res, next) => {
  const quiz = req.quiz;
  const now = new Date();
  const DueDate = quiz.startedAt + quiz.timelimit*60000;
  
  if (DueDate>now && !quiz.allowLateSubmissions) {
    return next(new AppError('Quiz submission deadline has passed', 400));
  }
  
  next();
});

// Check due date for assignment
const checkAssignmentDueDate = asyncWrapper(async (req, res, next) => {
  const assignment = req.assignment;
  const now = new Date();
  const isLate = assignment.dueDate && now > assignment.dueDate;
  
  if (isLate && !assignment.allowLateSubmissions) {
    return next(new AppError('Assignment submission deadline has passed', 400));
  }
  
  next();
});

// Validate attachment URL (must be PDF)
const validateAttachment = asyncWrapper(async (req, res, next) => {
  const { attachment } = req.body;
  
  if (!attachment || typeof attachment !== 'string') {
    return next(new AppError('Attachment URL is required', 400));
  }
  
  // Check if URL ends with .pdf (case insensitive)
  if (!attachment.toLowerCase().endsWith('.pdf')) {
    return next(new AppError('Only PDF files are allowed', 400));
  }
  
  next();
});

// Admin submission middleware functions
// Ensure submission exists and attach it to req.submission
const subExist = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const submission = await Submission.findOne({ where: { subId: id } });
  if (!submission) {
    return next(new AppError('Submission not found', 404));
  }
  req.submission = submission;
  next();
});

// Ensure admin can see/modify this submission (basic check; superadmin bypass)
const canSeeSubmission = asyncWrapper(async (req, res, next) => {
  const admin = req.admin;
  if (!admin) {
    return next(new AppError('Not authorized', 401));
  }
  // Super admin override
  if (String(admin.adminId) === '1') {
    return next();
  }
  // For now, allow; implement stricter checks if business rules require
  next();
});

// Ensure submission is not already marked
const marked = asyncWrapper(async (req, res, next) => {
  const submission = req.submission;
  if (!submission) {
    return next(new AppError('Submission not loaded', 500));
  }
  if (submission.score != null) {
    return next(new AppError('Submission already marked', 400));
  }
  next();
});

// Validate grading payload
const checkData = asyncWrapper(async (req, res, next) => {
  const { score } = req.body;
  if (score == null || Number.isNaN(Number(score))) {
    return next(new AppError('Score is required and must be a number', 400));
  }
  next();
});

module.exports = {
  quizExistsAndPublished,
  assignmentExistsAndPublished,
  checkQuizNotSubmitted,
  checkAssignmentNotSubmitted,
  checkQuizDueDate,
  checkAssignmentDueDate,
  validateAttachment,
  // Admin submission functions
  subExist,
  canSeeSubmission,
  marked,
  checkData
};