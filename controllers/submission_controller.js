const asyncWrapper = require('../middleware/asyncwrapper');
const AppError = require('../utils/app.error');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const student = require('../data_link/student_data_link');
const { Submission, Quiz, Assignment, Admin, Student } = require('../models');
const {addToScore} = require("../data_link/student_data_link");

// Submit Quiz
const submitQuiz = asyncWrapper(async (req, res) => {
  const { attachment } = req.body;
  const studentId = req.student.id;
  const studentData = await student.findStudentById(studentId);
  const quiz = req.quiz; // From middleware
  const submissionData = {
    studentId,
    quizId: quiz.quizId,
    answers: attachment,
    type: 'quiz',
    semester: quiz.semester,
    subDate: new Date(),
    assistantId: studentData.assistantId
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
  const studentData = await student.findStudentById(studentId);
  const assignment = req.assignment; // From middleware
  
  const submissionData = {
    studentId,
    assId: assignment.assignmentId,
    answers: attachment,
    type: 'assignment',
    semester: assignment.semester,
    subDate: new Date(),
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

  };

  return res.status(201).json({
    status: "success",
    message: "Assignment submitted successfully",
    data: {
      submission: response
    }
  });
});



// Grade Assignment Submission
const gradeAssignmentSubmission = asyncWrapper(async (req, res) => {
    const submission = req.submission;
    const { score, feedback, marked,grade } = req.body;
    const stud = await student.findStudentById(submission.studentId);
    stud.totalScore += score;
    await stud.save();

  
  const assignment = await Assignment.findByPk(submission.assId);
  const percentage = assignment ? (score / assignment.maxPoints) * 100 : 0;
  
  await submission.update({
    score,
    percentage,
    grade,
    feedback,
    status: 'marked',
    gradedAt: new Date(),
    gradedBy: req.admin.name
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
          marked,
          gradedBy: req.admin.name,
          status: 'marked',
          gradedAt: new Date(),
      }
    }
  });
});

// Grade Quiz Submission
const gradeSubmission = asyncWrapper(async (req, res) => {
  const submission= req.submission;
  console.log(submission);
  const { score, feedback, marked } = req.body;
  const stud = await student.findStudentById(submission.studentId);
  console.log(stud.studentId);
    stud.totalScore += score;
    await stud.save();
let percentage;
  const quiz = await Quiz.findByPk(submission.quizId);
  if(quiz){
       percentage = quiz ? (score / quiz.maxPoints) * 100 : 0;
  }
  else{
        const assignment = await Assignment.findByPk(submission.assId);
         percentage = assignment ? (score / assignment.maxPoints) * 100 : 0;
  }
    let grade;
    if (percentage >= 80) {
        grade = 'A*';
    } else if (percentage >= 70) {
        grade= 'A';
    } else if (percentage >= 60) {
        grade= 'B';
    } else if (percentage >= 50) {
        grade= 'C';
    } else {
        grade= 'U';
    }

  await submission.update({
    score,
    percentage,
      marked,
    grade,
    feedback,
      status : "marked",
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
        marked,
        gradedBy: req.admin.name,
          status: 'marked',
          gradedAt: new Date(),
      }
    }
  });
});


module.exports = {
  submitQuiz,//Done and Tested
  submitAssignment,//Done and Tested
  gradeAssignmentSubmission,//Done
  gradeSubmission,//Done
};