const sequelize = require('../config/database');
const Student = require('../models/student_model.js');
const student = require('../data_link/student_data_link');
const admin = require('../data_link/admin_data_link.js');
const feed = require('../data_link/feed_data_link.js');
const bcrypt = require('bcrypt');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const asyncWrapper = require('../middleware/asyncwrapper');
const jwt = require("jsonwebtoken");
const quizLink= require('../data_link/quiz_data_link.js');
const { notifyAssistants } = require('../utils/sseClients');
const Registration = require('../models/registration_model.js');
const assignment = require('../data_link/assignment_data_link.js');
const submission = require('../data_link/assignment_data_link.js');
const Assignment = require('../models/assignment_model.js');


const studentRegister = asyncWrapper(async (req, res) => {
  const {
    studentEmail,
    studentName,
    password,
    studentPhoneNumber,
    parentPhoneNumber,
    parentEmail,
    birthDate,
    group,
    semester
  } = req.body;

  // Create the student
  await student.createStudent(
    studentName,
    studentEmail,
    password,
    parentEmail,
    birthDate,
    studentPhoneNumber,
    parentPhoneNumber,
    group,
    semester
  );
  await student.registerStudent(studentEmail, group);

  // Notify only assistants in the same group
  notifyAssistants(group, {
    event: "student_registered",
    message: `New student ${studentName} registered`,
    Student: { id : Student.studentId, studentName, studentEmail, group }
  });

  return res.status(201).json({
    status: "success",
    data: { message: "Student registered successfully" }
  });
});

const showMyAdminProfile = asyncWrapper(async (req, res) => {
  const studentId = req.student.id;
  const found= await student.findStudentById(studentId);
  const adminId= found.assistantId;
  const adminProfile = await admin.findAdminById(adminId);
  return res.status(200).json({
      status: "success",
      data: { 
        id: adminProfile.adminId,
        adminName: adminProfile.name,
        adminEmail: adminProfile.email,
        PhoneNumber: adminProfile.phoneNumber,
        group : adminProfile.group
       }
  });
});

const showMyProfile = asyncWrapper(async (req, res) => {
  const studentId = req.student.id;
  const studentProfile = await student.findStudentById(studentId);
  return res.status(200).json({
      status: "success",
      data: { 
        id: studentProfile.studentId,
        studentName: studentProfile.studentName,
        studentEmail: studentProfile.studentEmail,
        birthDate: studentProfile.birthDate,
        studentPhoneNumber: studentProfile.studentPhoneNumber,
        parentPhoneNumber: studentProfile.parentPhoneNumber,
        parentEmail: studentProfile.parentEmail,
        group : studentProfile.group,
        semester: studentProfile.semester,
        totalScore: studentProfile.totalScore
       }
  });
});

const getMyFeed = asyncWrapper(async (req, res, next) => {
    const studentId = req.student.id;
    const studentProfile = await student.findStudentById(studentId);
    const assistantId = studentProfile.assistantId;
    const semester = studentProfile.semester;
    const feeds = await feed.getFeedByAssistantIdAndSemester(assistantId, semester);
    if (!feeds || feeds.length === 0) {
        return next(new AppError("No feed found for your assistant", httpStatus.NOT_FOUND));
    }
    return res.status(200).json({
        status: "success",
        results: feeds.length,
        data: { feeds }
    })
});

const showMySubmission = asyncWrapper(async (req, res) => {
    const studentId = req.student.id;
    const {type , status} = req.body;
    if(type !== "quiz" && type !== "assignment"){
        return res.status(400).json({
            message: "Type must be quiz or assignment"
        });
    }
    const profile = await student.findStudentById(studentId);
    const submissions = await student.showSubmissions(type, status, studentId);
    console.log(studentId);
    if (!submissions || submissions.length === 0) {
        return res.status(200).json({ message: "No submissions found" });
    }
    return res.status(200).json({
        status: "success",
        message: `submissions for student ${profile.studentName}`,
        data: {
            submissions: submissions.map(submission => ({
                id: submission.subId,
                assistantId: submission.assistantId,
                quizId: submission.quizId,
                assignmentId: submission.assId,
                submittedAt: submission.createdAt,
                score: submission.score,
                status: submission.status,
                gradedby: submission.gradedby,
                feedback: submission.feedback,
            }))
        }
    });
})

const showASubmission = asyncWrapper(async (req, res) => {
    const found = req.submission;
    return res.status(200).json({
        status: "success",
        data: {found}
    })
})

const deleteSub = asyncWrapper(async (req, res) => {
    const found = req.submission;
    await found.destroy();
    return res.status(200).json({
        status: "success",
        message: "Submission deleted successfully"
    })
})

// Student quiz trend: per-quiz points grouped by week, for line chart
const getQuizTrend = asyncWrapper(async (req, res) => {
  const { from, to } = req.query; // optional ISO dates
  const { Op } = require('sequelize');
  const Submission = require('../models/submission_model');
  const studentId = req.student.id;
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  // get student's group to pull all quizzes for that group
  const me = await student.findStudentById(studentId);
  const allQuizzes = await quizLink.getAllQuizzesForGroup(me.group);
  const quizzes = allQuizzes
    .filter(q => (fromDate ? new Date(q.date) >= fromDate : true))
    .filter(q => (toDate ? new Date(q.date) <= toDate : true))
    .map(q => ({ quizId: q.quizId, date: q.date, totalMark: q.mark }))
    .sort((a,b) => new Date(a.date) - new Date(b.date));

  const quizIds = quizzes.map(q => q.quizId);
  const subs = quizIds.length ? await Submission.findAll({ where: { studentId, type: 'quiz', quizId: { [Op.in]: quizIds } }, raw: true }) : [];
  const subMap = new Map(subs.map(s => [s.quizId, s]));

 // Build one point per quiz; if no submission or score 0 -> percentage 0
  const points = quizzes
    .map((q, idx) => {
      const when = new Date(q.date);
      const week = idx + 1; // sequential week index based on date order
      const sub = subMap.get(q.quizId);
      const score = sub && typeof sub.score === 'number' ? sub.score : 0;
      const totalMark = typeof q.totalMark === 'number' && q.totalMark > 0 ? q.totalMark : null;
      return { quizId: q.quizId, date: when, week, score, totalMark: q.totalMark };
    })
    ;

  // For chart: y-axis = Week, x-axis= Row grade
  const chartPoints = points.map(p => ({ y: p.week, x: p.score, quizId: p.quizId, date: p.date }));

  return res.status(200).json({ status: 'success', data: { points, chartPoints } });
})

// ==================== GET MY WEEKLY REPORT FUNCTION ====================

// Helper function to get student submission for assignment
const getStudentSubmissionForAssignment = async (studentId, assignmentId) => {
  const Submission = require('../models/submission_model');
  return await Submission.findOne({
      where: {
          studentId: studentId,
          assId: assignmentId,
          type: 'assignment'
      }
  });
};

// Helper function to get student submission for quiz
const getStudentSubmissionForQuiz = async (studentId, quizId) => {
  const Submission = require('../models/submission_model');
  return await Submission.findOne({
      where: {
          studentId: studentId,
          quizId: quizId,
          type: 'quiz'
      }
  });
};

const getMyWeeklyReport = asyncWrapper(async (req, res) => {
    const { topicId } = req.params;
    const studentId = req.student.id;
    
    try {
        // Get student data
        const studentData = await student.findStudentById(studentId);
        if (!studentData) {
            return res.status(404).json({
                status: "error",
                message: "Student not found"
            });
        }
        
        // Get topic details
        const Topic = require('../models/topic_model');
        let topic;
        
        if (topicId && topicId !== 'latest') {
            // Get specific topic
            topic = await Topic.findOne({
                where: { topicId: topicId }
            });
        } else {
            // Get latest topic
            topic = await Topic.findOne({
                order: [['createdAt', 'DESC']]
            });
        }
        
        if (!topic) {
            return res.status(404).json({
                status: "error",
                message: "Topic not found"
            });
        }
        
        // Get assignments in this topic
        const Assignment = require('../models/assignment_model');
        const assignments = await Assignment.findAll({
            where: { topicId: topic.topicId },
            order: [['createdAt', 'ASC']]
        });
        
        // Get quizzes in this topic
        const Quiz = require('../models/quiz_model');
        const quizzes = await Quiz.findAll({
            where: { topicId: topic.topicId },
            order: [['createdAt', 'ASC']]
        });
        
        // Create report data
        const reportData = {
            topicTitle: topic.title,
            studentName: studentData.studentName,
            semester: topic.semester,
            materials: []
        };
        
        // Process assignments
        for (let index = 0; index < assignments.length; index++) {
            const assignment = assignments[index];
            const submission = await getStudentSubmissionForAssignment(studentId, assignment.assignmentId);
            
            const assignmentData = {
                type: 'assignment',
                columnName: `Hw${index + 1}`,
                title: assignment.title,
                maxPoints: assignment.maxPoints,
                status: submission && submission.marked === 'yes' ? 'Done' : 'Missing',
                score: submission ? submission.score : null,
                feedback: submission ? submission.feedback : null
            };
            
            reportData.materials.push(assignmentData);
        }
        
        // Process quizzes
        for (let index = 0; index < quizzes.length; index++) {
            const quiz = quizzes[index];
            const submission = await getStudentSubmissionForQuiz(studentId, quiz.quizId);
            
            const topicOrder = topic.order || 1;
            const quizColumnName = `Quiz${topicOrder}`;
            
            let percentage = 0;
            let grade = 'U';
            
            if (submission && submission.score !== null) {
                percentage = (submission.score / quiz.maxPoints) * 100;
                
                if (percentage >= 80) {
                    grade = 'A*';
                } else if (percentage >= 70) {
                    grade = 'A';
                } else if (percentage >= 60) {
                    grade = 'B';
                } else if (percentage >= 50) {
                    grade = 'C';
                } else {
                    grade = 'U';
                }
            }
            
            const quizData = {
                type: 'quiz',
                columnName: quizColumnName,
                title: quiz.title,
                maxPoints: quiz.maxPoints,
                score: submission ? submission.score : null,
                percentage: submission ? percentage : null,
                grade: submission ? grade : null,
                feedback: submission ? submission.feedback : null
            };
            
            reportData.materials.push(quizData);
        }
        
        return res.status(200).json({
            status: "success",
            message: "Weekly report generated successfully",
            data: reportData
        });
        
    } catch (error) {
        console.error('Error generating weekly report:', error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
});

module.exports = {
    studentRegister,
    showMyAdminProfile,
    showMyProfile,
    getMyFeed,
    showMySubmission,
    showASubmission,
    getQuizTrend,
    deleteSub,
    getMyWeeklyReport
}