const Submission = require('../models/submission_model');
const Quiz = require('../models/quiz_model');
const Assignment = require('../models/assignment_model');
const { asyncWrapper } = require('../middleware/asyncwrapper');

// Submit Quiz
const submitQuiz = asyncWrapper(async (req, res) => {
  const { quizId } = req.params;
  const { answers, timeSpent } = req.body;
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
      status: 'submitted'
    }
  });
  
  if (existingSubmission && quiz.attempts === 1) {
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
  
  // Calculate attempt number
  const attemptCount = await Submission.count({
    where: { studentId, quizId }
  });
  
  const submissionData = {
    studentId,
    quizId,
    answers: JSON.stringify(answers),
    status: 'submitted',
    submittedAt: now,
    isLate,
    attemptNumber: attemptCount + 1,
    timeSpent,
    maxScore: quiz.maxPoints
  };
  
  // Auto-grade if possible (for multiple choice questions)
  if (quiz.questions && Array.isArray(quiz.questions)) {
    let score = 0;
    const questions = JSON.parse(quiz.questions);
    
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += question.points || 1;
      }
    });
    
    submissionData.score = score;
    submissionData.percentage = (score / quiz.maxPoints) * 100;
    submissionData.isAutoGraded = true;
    submissionData.status = 'graded';
    submissionData.gradedAt = now;
  }
  
  const submission = await Submission.create(submissionData);
  
  return res.status(201).json({
    status: "success",
    message: "Quiz submitted successfully",
    data: {
      submission
    }
  });
});

// Submit Assignment
const submitAssignment = asyncWrapper(async (req, res) => {
  const { assignmentId } = req.params;
  const { content, attachments } = req.body;
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
      assignmentId,
      status: 'submitted'
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
  
  const submissionData = {
    studentId,
    assignmentId,
    answers: content,
    attachments: attachments || [],
    status: 'submitted',
    submittedAt: now,
    isLate,
    maxScore: assignment.maxPoints
  };
  
  const submission = await Submission.create(submissionData);
  
  return res.status(201).json({
    status: "success",
    message: "Assignment submitted successfully",
    data: {
      submission
    }
  });
});

// Get Student Submissions
const getStudentSubmissions = asyncWrapper(async (req, res) => {
  const studentId = req.student.id;
  const { type, status } = req.query; // type: 'quiz' or 'assignment'
  
  const whereClause = { studentId };
  
  if (type === 'quiz') {
    whereClause.quizId = { $ne: null };
  } else if (type === 'assignment') {
    whereClause.assignmentId = { $ne: null };
  }
  
  if (status) {
    whereClause.status = status;
  }
  
  const submissions = await Submission.findAll({
    where: whereClause,
    include: [
      {
        model: Quiz,
        as: 'Quiz',
        attributes: ['quizId', 'title', 'maxPoints'],
        required: false
      },
      {
        model: Assignment,
        as: 'Assignment',
        attributes: ['assignmentId', 'title', 'maxPoints'],
        required: false
      }
    ],
    order: [['submittedAt', 'DESC']]
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
    where: { submissionId, studentId },
    include: [
      {
        model: Quiz,
        as: 'Quiz',
        attributes: ['quizId', 'title', 'maxPoints', 'showCorrectAnswers'],
        required: false
      },
      {
        model: Assignment,
        as: 'Assignment',
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
  const { answers, content, attachments } = req.body;
  const studentId = req.student.id;
  
  const submission = await Submission.findOne({
    where: { submissionId, studentId, status: 'draft' }
  });
  
  if (!submission) {
    return res.status(404).json({
      status: "error",
      message: "Draft submission not found"
    });
  }
  
  const updateData = {};
  if (answers) updateData.answers = JSON.stringify(answers);
  if (content) updateData.answers = content;
  if (attachments) updateData.attachments = attachments;
  
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
    where: { submissionId, studentId, status: 'draft' }
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
      submissionId, 
      assignmentId,
      isActive: true 
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

module.exports = {
  submitQuiz,
  submitAssignment,
  getStudentSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  gradeAssignmentSubmission
};
