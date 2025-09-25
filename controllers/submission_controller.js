const asyncWrapper = require('../middleware/asyncwrapper');
const AppError = require('../utils/app.error');
const { Op } = require('sequelize');
const { Submission, Quiz, Assignment, Admin } = require('../models');

// Submit Quiz
const submitQuiz = asyncWrapper(async (req, res) => {
  const { quizId } = req.params;
  const { attachment } = req.body;
  const studentId = req.student.id;
  
  const quiz = await Quiz.findOne({
    where: { quizId, isActive: true, isPublished: true }
  });
  
  if (!quiz) {
    return res.status(404).json({
      status: "error",
      message: "Quiz not found or not published"
    });
  }
  
  // Check if student already submitted
  const existingSubmission = await Submission.findOne({
    where: { 
      studentId, 
      quizId,
      type: 'quiz'
    }
  });
  
  if (existingSubmission) {
    return res.status(400).json({
      status: "error",
      message: "You have already submitted this quiz"
    });
  }
  
  // Check due date
  const now = new Date();
  const isLate = quiz.dueDate && now > quiz.dueDate;
  
  if (isLate && !quiz.allowLateSubmissions) {
    return res.status(400).json({
      status: "error",
      message: "Quiz submission deadline has passed"
    });
  }
  
  // Validate attachment URL
  if (!attachment || typeof attachment !== 'string') {
    return res.status(400).json({
      status: "error",
      message: "Attachment URL is required"
    });
  }
  
  const submissionData = {
    studentId,
    quizId,
    answers: attachment, // Store PDF URL as answers
    type: 'quiz',
    semester: quiz.semester,
    subDate: now,
    status: 'submitted'
  };
  
  const submission = await Submission.create(submissionData);
  const response = {
    subId: submission.subId,
    studentId: submission.studentId,
    quizId: submission.quizId,
    answers: submission.answers,
    type: submission.type,
    semester: submission.semester,
    score: submission.score ?? null,
    marked: submission.score != null ? 'yes' : 'no',
  };

  return res.status(201).json({
    status: "success",
    message: "Quiz submitted successfully",
    data: {
      submission: response
    }
  });
});

// Submit Assignment
const submitAssignment = asyncWrapper(async (req, res) => {
  const { assignmentId } = req.params;
  const { attachment } = req.body;
  const studentId = req.student.id;
  
  const assignment = await Assignment.findOne({
    where: { assignmentId, isActive: true, isPublished: true }
  });
  
  if (!assignment) {
    return res.status(404).json({
      status: "error",
      message: "Assignment not found or not published"
    });
  }
  
  // Check if student already submitted
  const existingSubmission = await Submission.findOne({
    where: { 
      studentId, 
      assId: assignmentId,
      type: 'assignment'
    }
  });
  
  if (existingSubmission) {
    return res.status(400).json({
      status: "error",
      message: "You have already submitted this assignment"
    });
  }
  
  // Check due date
  const now = new Date();
  const isLate = assignment.dueDate && now > assignment.dueDate;
  
  if (isLate && !assignment.allowLateSubmissions) {
    return res.status(400).json({
      status: "error",
      message: "Assignment submission deadline has passed"
    });
  }
  
  // Validate attachment URL
  if (!attachment || typeof attachment !== 'string') {
    return res.status(400).json({
      status: "error",
      message: "Attachment URL is required"
    });
  }
  
  const submissionData = {
    studentId,
    assId: assignmentId,
    answers: attachment, // Store PDF URL as answers
    type: 'assignment',
    semester: assignment.semester,
    subDate: now,
    status: 'submitted'
  };
  
  const submission = await Submission.create(submissionData);
  const response = {
    subId: submission.subId,
    studentId: submission.studentId,
    assId: submission.assId ?? undefined,
    answers: submission.answers,
    type: submission.type,
    semester: submission.semester,
    score: submission.score ?? null,
    marked: submission.score != null ? 'yes' : 'no',
    assistantName
  };

  return res.status(201).json({
    status: "success",
    message: "Assignment submitted successfully",
    data: {
      submission: response
    }
  });
});

// Get Student Submissions
const getStudentSubmissions = asyncWrapper(async (req, res) => {
  const studentId = req.student.id;
  const { type, status } = req.query; // type: 'quiz' or 'assignment'
  
  const whereClause = { studentId };
  
  if (type === 'quiz') {
    whereClause.quizId = { [Op.ne]: null };
  } else if (type === 'assignment') {
    whereClause.assId = { [Op.ne]: null };
  }
  
  if (status) {
    whereClause.status = status;
  }
  
  const submissions = await Submission.findAll({
    where: whereClause,
    include: [
      {
        model: Quiz,
        attributes: ['quizId', 'title', 'maxPoints'],
        required: false
      },
      {
        model: Assignment,
        attributes: ['assignmentId', 'title', 'maxPoints'],
        required: false
      }
    ],
    order: [['subDate', 'DESC']]
  });
  
  return res.status(200).json({
    status: "success",
    message: "Submissions retrieved successfully",
    data: {
      submissions,
      count: submissions.length
    }
  });
});

// Get Submission by ID
const getSubmissionById = asyncWrapper(async (req, res) => {
  const { submissionId } = req.params;
  const studentId = req.student.id;
  
  const submission = await Submission.findOne({
    where: { subId: submissionId, studentId },
    include: [
      {
        model: Quiz,
        attributes: ['quizId', 'title', 'maxPoints', 'showResults'],
        required: false
      },
      {
        model: Assignment,
        attributes: ['assignmentId', 'title', 'maxPoints'],
        required: false
      }
    ]
  });
  
  if (!submission) {
    return res.status(404).json({
      status: "error",
      message: "Submission not found"
    });
  }
  
  return res.status(200).json({
    status: "success",
    message: "Submission retrieved successfully",
    data: {
      submission
    }
  });
});

// Update Submission (for draft submissions)
const updateSubmission = asyncWrapper(async (req, res) => {
  const { submissionId } = req.params;
  const { attachment } = req.body;
  const studentId = req.student.id;
  
  const submission = await Submission.findOne({
    where: { subId: submissionId, studentId, status: 'draft' }
  });
  
  if (!submission) {
    return res.status(404).json({
      status: "error",
      message: "Draft submission not found"
    });
  }
  
  // Validate attachment URL
  if (!attachment || typeof attachment !== 'string') {
    return res.status(400).json({
      status: "error",
      message: "Attachment URL is required"
    });
  }
  
  const updateData = { answers: attachment };
  
  await submission.update(updateData);
  
  return res.status(200).json({
    status: "success",
    message: "Submission updated successfully",
    data: {
      submission
    }
  });
});

// Delete Submission (only if draft)
const deleteSubmission = asyncWrapper(async (req, res) => {
  const { submissionId } = req.params;
  const studentId = req.student.id;
  
  const submission = await Submission.findOne({
    where: { subId: submissionId, studentId, status: 'draft' }
  });
  
  if (!submission) {
    return res.status(404).json({
      status: "error",
      message: "Draft submission not found"
    });
  }
  
  await submission.destroy();
  
  return res.status(200).json({
    status: "success",
    message: "Submission deleted successfully"
  });
});


// Grade Assignment Submission
const gradeAssignmentSubmission = asyncWrapper(async (req, res) => {
  const { assignmentId, submissionId } = req.params;
  const { score, feedback, grade } = req.body;
  
  const submission = await Submission.findOne({
    where: { 
      subId: submissionId, 
      assId: assignmentId
    }
  });
  
  if (!submission) {
    return res.status(404).json({
      status: "error",
      message: "Submission not found"
    });
  }
  
  const assignment = await Assignment.findByPk(assignmentId);
  const percentage = assignment ? (score / assignment.maxPoints) * 100 : 0;
  
  await submission.update({
    score,
    percentage,
    grade,
    feedback,
    status: 'graded',
    gradedAt: new Date()
  });
  
  return res.status(200).json({
    status: "success",
    message: "Submission graded successfully",
    data: {
      submission: {
        submissionId: submission.submissionId,
        score,
        percentage,
        grade,
        feedback,
        status: 'graded',
        gradedAt: new Date()
      }
    }
  });
});

// Grade Quiz Submission
const gradeQuizSubmission = asyncWrapper(async (req, res) => {
  const { quizId, submissionId } = req.params;
  const { score, feedback, grade } = req.body;

  const submission = await Submission.findOne({
    where: {
      subId: submissionId,
      quizId
    }
  });

  if (!submission) {
    return res.status(404).json({
      status: "error",
      message: "Submission not found"
    });
  }

  const quiz = await Quiz.findByPk(quizId);
  const percentage = quiz ? (score / quiz.maxPoints) * 100 : 0;

  await submission.update({
    score,
    percentage,
    grade,
    feedback,
    markedAt: new Date()
  });
  
  const assistantName = req.admin?.name || null;

  return res.status(200).json({
    status: "success",
    message: "Submission graded successfully",
    data: {
      submission: {
        subId: submission.subId,
        score,
        percentage,
        grade,
        feedback,
        marked: 'yes',
        assistantName
      }
    }
  });
});

// Get current student's quiz submission status
const getQuizSubmissionStatus = asyncWrapper(async (req, res) => {
  const { quizId } = req.params;
  const studentId = req.student.id;

  const submission = await Submission.findOne({ where: { studentId, quizId, type: 'quiz' } });

  const response = submission
    ? { marked: submission.score != null ? 'yes' : 'no', score: submission.score ?? null }
    : { marked: 'no', score: null };

  return res.status(200).json({ status: 'success', data: response });
});


module.exports = {
  submitQuiz,
  submitAssignment,
  getStudentSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  gradeAssignmentSubmission,
  gradeQuizSubmission,
  getQuizSubmissionStatus
};

