const sequelize = require('../config/database');
const Admin = require('../models/admin_model.js');
const Student = require('../models/student_model.js');
const bcrypt = require('bcrypt');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const asyncWrapper = require('../middleware/asyncwrapper');
const jwt = require("jsonwebtoken");
const Regection = require('../models/rejection_model.js');
const rejection = require('../data_link/admin_data_link');
const Registration = require('../models/registration_model.js');
const registration = require('../data_link/admin_data_link');
const admin = require('../data_link/admin_data_link.js');
const student = require('../data_link/student_data_link.js');
const feed = require('../data_link/admin_data_link.js');
const sse = require('../utils/sseClients.js');


const TARegister = asyncWrapper(async (req, res) => {
    const { email, name, password, phoneNumber, group} = req.body;
    const encryptedPassword = await bcrypt.hash(String(password), 10);
    const created=await admin.create(email,name,encryptedPassword,phoneNumber,group);

    return res.status(201).json({
        status: "success" ,
        message: "Assistant created successfully",
        data: {id :created.adminId, 
               email: created.email, 
               name: created.name, 
               phoneNumber: created.phoneNumber, 
               group: created.group}
    });
});



const showPendingRegistration = asyncWrapper(async (req, res) => {
  const TAGroup = req.admin.group;
    const students = await admin.findNotVerifiedStudentsByTaGroup(TAGroup);
    return res.status(200).json({
        status: "success",
        message: `Pending registration from students`,
        data: { 
  data: students.map(student => ({
      name: student.studentName,
      email: student.studentEmail,
      group: student.group
    }))
}})});

const verifyStudent = asyncWrapper(async (req, res) => {
  const student = req.student; // must be set earlier by studentFound
  student.verified = true;
  student.assistantId = req.admin.id; // set the admin who verified
  await student.save();
  await rejection.Destroy( student.studentEmail);
  await registration.registrationDestroy(student.studentEmail);
  return res.status(200).json({ 
    status: "success",
    message: `Student ${student.studentName} verified successfully`,
    data: { id: student.studentId,
            studentEmail: student.studentEmail,
            studentName : student.studentName ,
            group : student.group
     }
  });
});

const showStudentInGroup = asyncWrapper(async (req, res) => {
    const TAGroup = req.admin.group;
    const students = await admin.findVerifiedStudentsByTaGroup(TAGroup);
    return res.status(200).json({
        status: "success",
        message: `Students in group ${TAGroup}`,
        data: { 
  data: students.map(student => ({
      id: student.studentId,
      name: student.studentName,
      email: student.studentEmail,
    }))
}})});


const removeStudent = asyncWrapper(async (req, res) => {
  const student = req.student; // must be set earlier by studentFound
  await student.destroy();
  return res.status(200).json({
    status: "success",
    message: `Student ${student.studentName} deleted successfully`,
    data: { id: student.studentId,
            studentEmail: student.studentEmail,
            studentName : student.studentName ,
            group : student.group }
  });
});

const banStudent = asyncWrapper(async (req, res) => {
  const student = req.student; // must be set earlier by studentFound
  student.banned = true; // assuming you have a banned field
  await student.save();
  return res.status(200).json({
    status: "success",
    message: `Student ${student.studentName} banned successfully`,
    data: { id: student.studentId,
            studentEmail: student.studentEmail,
            studentName : student.studentName ,
            group : student.group }
  });
});

const unBanStudent = asyncWrapper(async (req, res) => {
  const student = req.student; // must be set earlier by studentFound
  student.banned = false; // assuming you have a banned field
  await student.save();
  return res.status(200).json({
    status: "success",
    message: `Student ${student.studentName} unbanned successfully`,
    data: { id: student.studentId,
            studentEmail: student.studentEmail,
            studentName : student.studentName ,
            group : student.group }
  });
});

const rejectStudent = asyncWrapper(async (req, res) => {
  const student = req.student; // must be set earlier by studentFound
  const adminId = req.admin.id;
  console.log(adminId) // assuming adminId is available in req.admin
  await rejection.createRejection(student.studentEmail,adminId,student.semester);
  const rej = await registration.findRegistration(student.studentEmail);
  rej.rejectionCount += 1;
  await rej.save();
  const adminCount = await admin.Count(student.group);
  console.log("adminCount : ", adminCount);
  if (rej.rejectionCount >= adminCount) {
    await registration.registrationDestroy(student.studentEmail);
    await student.destroy();
    await rejection.Destroy(student.studentEmail);
  }
  return res.status(200).json({
    status: "success",
    message: `Student ${student.studentName} rejected successfully`,
    data: { id: student.studentId,
            studentEmail: student.studentEmail,
            studentName : student.studentName ,
            group : student.group }
  });
});

const showMyProfile = asyncWrapper(async (req, res) => {
  const adminId = req.admin.id;
  const adminProfile = await admin.findAdminById(adminId);
  return res.status(200).json({
    status: "success",
    data: {
      id : adminProfile.adminId,
      adminName: adminProfile.name,
      adminEmail: adminProfile.email,
      PhoneNumber: adminProfile.phoneNumber,
      group : adminProfile.group
    }
  });
});

const showStudentProfile= asyncWrapper(async (req, res) => {
  const studentProfile = req.student; // must be set earlier by studentFound
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

const showUnmarkedSubmissions = asyncWrapper(async (req, res) => {
    const adminId = req.admin.id;
    const adminProfile = await admin.findAdminById(adminId);
    console.log(adminId);
    const pendingSubmissions = (adminId === 1
        ? await admin.getAllUnmarkedSubmissions()
        : await admin.getUnmarkedSubmissionsByAdminId(adminId));

    if (!pendingSubmissions || pendingSubmissions.length === 0) {
        return res.status(200).json({ message: "No unmarked submissions found" });
    }
    return res.status(200).json({
        status: "success",
        message: `Unmarked submissions for admin ${adminProfile.name}`,
        data: {
            submissions: pendingSubmissions.map(submission => ({
                id: submission.subId,
                studentId: submission.studentId,
                quizId: submission.quizId,
                assignmentId: submission.assId,
                submittedAt: submission.createdAt
            }))
        }
    });
});

const findSubmissionById = asyncWrapper(async (req, res) => {
    const found = req.submission;
    return res.status(200).json({
        status: "success",
        data: {found}
    })
})

const showAllSubmissions = asyncWrapper(async (req, res) => {
    const assistantId = req.admin.id;
    const adminProfile = await admin.findAdminById(assistantId);
    console.log(assistantId);
    const submissions = (assistantId === 1
        ? await admin.getAllSubmissions()
        : await admin.getAllSubmissionsById(assistantId));

    if (!submissions || submissions.length === 0) {
        return res.status(200).json({ message: "No unmarked submissions found" });
    }
    return res.status(200).json({
        status: "success",
        message: `Unmarked submissions for admin ${adminProfile.name}`,
        data: {
            submissions: submissions.map(submission => ({
                id: submission.subId,
                studentId: submission.studentId,
                quizId: submission.quizId,
                assignmentId: submission.assId,
                submittedAt: submission.createdAt
            }))
        }
    });

})

const deleteSubByAdmin = asyncWrapper(async (req, res) => {
    const found = req.submission;
    await found.destroy();
    return res.status(200).json({
        status: "success",
        message: "Submission deleted successfully"
    })
})

const markSubmission = asyncWrapper(async (req, res) => {
    const found = req.submission;
    const studentSub = await student.findStudentById(found.studentId)   ;
    const {marked, score, feedback} = req.body
    found.score = score;
    found.marked = marked;
    found.feedback = feedback;
    found.markedAt = new Date();
    studentSub.totalScore += score;
    await studentSub.save();
    await found.save();
    return res.status(200).json({
        status: "success",
        message: `Submission marked successfully`,
        data: {found}
    })
})

// ==================== GENERATE REPORT FUNCTION ====================


// Export the grading system function for reuse
const getGradingSystem = () => {
    return {
        calculateGrade: (percentage) => {
            // Using the same grading system as in generateWeeklyReport
            // =IF(H2>=80,"A*",IF(H2>=70,"A",IF(H2>=60,"B",IF(H2>=50,"C","U"))))
            if (percentage >= 80) {
                return 'A*';
            } else if (percentage >= 70) {
                return 'A';
            } else if (percentage >= 60) {
                return 'B';
            } else if (percentage >= 50) {
                return 'C';
            } else {
                return 'U';
            }
        },
        getGradeScale: () => {
            return [
                { percentage: 80, letter: 'A*' },
                { percentage: 70, letter: 'A' },
                { percentage: 60, letter: 'B' },
                { percentage: 50, letter: 'C' },
                { percentage: 0, letter: 'U' }
            ];
        }
    };
};


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

const generateReport = asyncWrapper(async (req, res) => {
  const { topicId } = req.params;
  const adminId = parseInt(req.admin.id); // Ensure adminId is an integer
  
  try {
      // Get admin's students only
      const adminStudents = await student.getStudentsByAdminId(adminId);
      
      if (!adminStudents || adminStudents.length === 0) {
          return res.status(404).json({
              status: "error",
              message: "No students found for this admin"
          });
      }
      
      // Get topic details
      const Topic = require('../models/topic_model');
      const topic = await Topic.findByPk(parseInt(topicId)); // Ensure topicId is an integer
      
      if (!topic) {
          return res.status(404).json({
              status: "error",
              message: "Topic not found"
          });
      }
      
      // Get assignments in this topic
      const Assignment = require('../models/assignment_model');
      const assignments = await Assignment.findAll({
          where: { topicId: parseInt(topicId) }, // Ensure topicId is an integer
          order: [['createdAt', 'ASC']]
      });
      
      // Get quizzes in this topic
      const Quiz = require('../models/quiz_model');
      const quizzes = await Quiz.findAll({
          where: { topicId: parseInt(topicId) }, // Ensure topicId is an integer
          order: [['createdAt', 'ASC']]
      });
      
      // Create report data
      const reportData = {
          topicTitle: topic.title,
          semester: topic.semester,
          students: []
      };
      
      // Generate student data
      for (const studentData of adminStudents) {
          const studentReport = {
              studentId: studentData.studentId,
              studentName: studentData.studentName,
              materials: []
          };
          
          // Process assignments
          for (let index = 0; index < assignments.length; index++) {
              const assignment = assignments[index];
              const submission = await getStudentSubmissionForAssignment(studentData.studentId, assignment.assignmentId);
              
              const assignmentData = {
                  type: 'assignment',
                  columnName: `Hw${index + 1}`,
                  title: assignment.title,
                  maxPoints: assignment.maxPoints,
                  status: submission && submission.marked === 'yes' ? 'Done' : 'Missing',
                  score: submission ? submission.score : null,
                  feedback: submission ? submission.feedback : null
              };
              
              studentReport.materials.push(assignmentData);
          }
          
          // Process quizzes
          for (let index = 0; index < quizzes.length; index++) {
              const quiz = quizzes[index];
              const submission = await getStudentSubmissionForQuiz(studentData.studentId, quiz.quizId);
              
              const topicOrder = topic.order || 1;
              const quizColumnName = `Quiz${topicOrder}`;
              
              let percentage = 0;
              let grade = 'U';
              
              if (submission && submission.score !== null) {
                  percentage = Math.round((submission.score / quiz.maxPoints) * 100);
                  grade = getGradingSystem().calculateGrade(percentage);
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
              
              studentReport.materials.push(quizData);
          }
          
          reportData.students.push(studentReport);
      }
      
      return res.status(200).json({
          status: "success",
          message: "Report generated successfully",
          data: reportData
      });

  } catch (error) {
      console.error('Error generating report:', error);
      return res.status(500).json({
          status: "error",
          message: "Failed to generate report",
          error: error.message
      });
  }
});
module.exports = {
    TARegister,
    showPendingRegistration,
    showStudentInGroup,
    verifyStudent,
    removeStudent,
    banStudent,
    unBanStudent,
    rejectStudent,
    showMyProfile,
    showStudentProfile,
    showUnmarkedSubmissions,
    findSubmissionById,
    showAllSubmissions,
    markSubmission,
    deleteSubByAdmin,
    // Generate Report Functions
    getGradingSystem,
    generateReport
}


