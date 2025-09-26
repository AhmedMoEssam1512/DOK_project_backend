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

const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const path = require('path');

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

// ==================== GENERATE REPORT FUNCTION ====================

const generateReport = asyncWrapper(async (req, res) => {
  const { topicId } = req.params;
  const adminId = req.admin.id;
  
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
      const topic = await Topic.findOne({
  where: {topicId}
});
      
      if (!topic) {
          return res.status(404).json({
              status: "error",
              message: "Topic not found"
          });
      }
      
      // Get assignments in this topic
      const Assignment = require('../models/assignment_model');
      const assignments = await Assignment.findAll({
          where: { topicId: topicId },
          order: [['createdAt', 'ASC']]
      });
      
      // Get quizzes in this topic
      const Quiz = require('../models/quiz_model');
      const quizzes = await Quiz.findAll({
          where: { topicId: topicId },
          order: [['createdAt', 'ASC']]
      });
      
      // Create report data
      const reportData = [];
      
      // Create headers
      const headers = ['Name'];
      
      // Add HW columns
      assignments.forEach((assignment, index) => {
          headers.push(`Hw${index + 1}`);
      });
      
      // Add Quiz columns
      if (quizzes.length > 0) {
          const topicOrder = topic.order || 1;
          const quizColumnName = `Quiz${topicOrder}`;
          headers.push(quizColumnName);
          headers.push(`${quizColumnName}_Percentage`);
          headers.push(`${quizColumnName}_Grade`);
      }
      
      // Generate student rows
      for (const student of adminStudents) {
          const row = { Name: student.studentName };
          
           // Get HW status (Done/Missing)
           for (let index = 0; index < assignments.length; index++) {
               const assignment = assignments[index];
               const submission = await getStudentSubmissionForAssignment(student.studentId, assignment.assignmentId);
               
               if (submission && submission.marked === 'yes') {
                   row[`Hw${index + 1}`] = 'Done';
               } else {
                   row[`Hw${index + 1}`] = 'Missing';
               }
           }
          
          // Get Quiz scores
          if (quizzes.length > 0) {
              const quiz = quizzes[0]; // Take first quiz if multiple
              const submission = await getStudentSubmissionForQuiz(student.studentId, quiz.quizId);
              
              if (submission && submission.score !== null) {
                  const score = submission.score;
                  const maxPoints = quiz.maxPoints || 100;
                  const percentage = Math.round((score / maxPoints) * 100);
                  const grade = getGradingSystem().calculateGrade(percentage);
                  
                  const topicOrder = topic.order || 1;
                  const quizColumnName = `Quiz${topicOrder}`;
                  
                  row[quizColumnName] = score;
                  row[`${quizColumnName}_Percentage`] = percentage;
                  row[`${quizColumnName}_Grade`] = grade;
              } else {
                  const topicOrder = topic.order || 1;
                  const quizColumnName = `Quiz${topicOrder}`;
                  
                  row[quizColumnName] = 0;
                  row[`${quizColumnName}_Percentage`] = 0;
                  row[`${quizColumnName}_Grade`] = 'U';
              }
          }
          
          reportData.push(row);
      }
      
      // Create Excel file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`${topic.title} Report`);
      
      // Add headers
      worksheet.addRow(headers);
      
      // Add data rows
      reportData.forEach(row => {
          worksheet.addRow(Object.values(row));
      });
      
      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Auto-fit columns
      worksheet.columns.forEach(column => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
              const columnLength = cell.value ? cell.value.toString().length : 10;
              if (columnLength > maxLength) {
                  maxLength = columnLength;
              }
          });
          column.width = Math.max(maxLength + 2, 12);
      });
      
     // Generate filename + save file in /reports
     const path = require('path');
      const fs = require('fs');

      const reportsDir = path.join(
        "C:/Users/2024/OneDrive - Cairo University - Students/Desktop/NOV 25/DOK_project_backend-main",
        "reports"
      );

      if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir);
      }

      const filename = `${topic.title}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      const filePath = path.join(reportsDir, filename);

      // Save then download
      await workbook.xlsx.writeFile(filePath);
      return res.download(filePath);

  } catch (error) {
      console.error('Error generating report:', error);
      return res.status(500).json({
          status: "error",
          message: "Failed to generate report",
          error: error.message
      });
  }

return res.status(200).json({
    status: "success",
    message: "Report created successfully",
    file: filename,
});
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


