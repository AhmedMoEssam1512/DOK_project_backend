const asyncWrapper = require('../middleware/asyncwrapper');
const AppError = require('../utils/app.error');
const { Op } = require('sequelize');
const student = require('../data_link/student_data_link');
const { Submission, Quiz, Assignment, Admin } = require('../models');

// Submit Quiz
const submitQuiz = asyncWrapper(async (req, res) => {
  const { attachment } = req.body;
  const studentId = req.student.id;
  const studentData = await student.getStudentById(studentId);
  const quiz = req.quiz; // From middleware
  const submissionData = {
    studentId,
    quizId: quiz.quizId,
    answers: attachment,
    type: 'quiz',
    semester: quiz.semester,
    subDate: new Date(),
    status: 'submitted',
    assistantId: studentData.assistantId || null
  };
  
  const submission = await Submission.create(submissionData);
  const response = {
    subId: submission.subId,
    studentId: submission.studentId,
    quizId: submission.quizId,
    answers: submission.answers,
    type: submission.type,
    assistantId: submission.assistantId ,
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
  const { attachment } = req.body;
  const studentId = req.student.id;
  const studentData = await student.getStudentById(studentId);
  const assignment = req.assignment; // From middleware
  
  const submissionData = {
    studentId,
    assId: assignment.assignmentId,
    answers: attachment,
    type: 'assignment',
    semester: assignment.semester,
    subDate: new Date(),
    status: 'submitted',
    assistantId: studentData.assistantId || null
  };
  
  const submission = await Submission.create(submissionData);
  const response = {
    subId: submission.subId,
    studentId: submission.studentId,
    assId: submission.assId ?? undefined,
    answers: submission.answers,
    type: submission.type,
    assistantId: submission.assistantId ,
    semester: submission.semester,
    score: submission.score ?? null,
    marked: submission.score != null ? 'yes' : 'no',
    assistantId: submission.assistantId ?? null
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
  const { type, status } = req.body; // type: 'quiz' or 'assignment'
  
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
  const submission= req.submission;
  const studentId = req.student.id;
  
  return res.status(200).json({
    status: "success",
    message: "Submission retrieved successfully",
    data: {
      submission
    }
  });
});

// Update Submission
const updateSubmission = asyncWrapper(async (req, res) => {
  const submission= req.submission;
  const { attachment } = req.body;
  const studentId = req.student.id;
  
  // Validate attachment URL
  if (!attachment || typeof attachment !== 'string') {
    return res.status(400).json({
      status: "error",
      message: "Attachment URL is required"
    });
  }
  
  
  await submission.update({ answers: attachment });
  
  return res.status(200).json({
    status: "success",
    message: "Submission updated successfully",
    data: {
      submission
    }
  });
});

// Delete Submission 
const deleteSubmission = asyncWrapper(async (req, res) => {
  const submission= req.submission;
  const studentId = req.student.id;
  
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
    gradedAt: new Date(),
    gradedBy: req.admin.name
  });
  
  return res.status(200).json({
    status: "success",
    message: "Submission graded successfully",
    data: {
      submission: {
        submissionId: submission.subId,
        score,
        percentage,
        grade,
        feedback,
        status: 'graded',
        gradedAt: new Date(),
      }
    }
  });
});

// Grade Quiz Submission
const gradeQuizSubmission = asyncWrapper(async (req, res) => {
  const { quizId} = req.params;
  const submission= req.submission;
  const { score, feedback, grade } = req.body;


  const quiz = await Quiz.findByPk(quizId);
  const percentage = quiz ? (score / quiz.maxPoints) * 100 : 0;
  
  await submission.update({
    score,
    percentage,
    grade,
    feedback,
    markedAt: new Date(),
    gradedBy: req.admin.name,
  });

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
        gradedBy: req.admin.name,
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
  submitQuiz,//Done and Tested
  submitAssignment,//Done and Tested
  getStudentSubmissions,//Done
  getSubmissionById,//Done
  updateSubmission,//Done
  deleteSubmission,//Done
  gradeAssignmentSubmission,//Done
  gradeQuizSubmission,//Done
  getQuizSubmissionStatus//Done
};

