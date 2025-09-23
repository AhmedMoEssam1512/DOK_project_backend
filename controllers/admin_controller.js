const sequelize = require('../config/database');
const Admin = require('../models/admin_model.js');
const Student = require('../models/student_model.js');
const bcrypt = require('bcrypt');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const { asyncWrapper } = require('../middleware/asyncwrapper');
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
    await admin.create(email,name,password,phoneNumber,group);

    return res.status(201).json({
        status: "success" ,
        data: { message: "Assistant created successfully" }
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
    data: { studentEmail: student.studentEmail }
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
    data: { studentEmail: student.studentEmail }
  });
});

const banStudent = asyncWrapper(async (req, res) => {
  const student = req.student; // must be set earlier by studentFound
  student.banned = true; // assuming you have a banned field
  await student.save();
  return res.status(200).json({
    status: "success",
    message: `Student ${student.studentName} banned successfully`,
    data: { studentEmail: student.studentEmail }
  });
});

const unBanStudent = asyncWrapper(async (req, res) => {
  const student = req.student; // must be set earlier by studentFound
  student.banned = false; // assuming you have a banned field
  await student.save();
  return res.status(200).json({
    status: "success",
    message: `Student ${student.studentName} unbanned successfully`,
    data: { studentEmail: student.studentEmail }
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
    data: { studentEmail: student.studentEmail }
  });
});

const showMyProfile = asyncWrapper(async (req, res) => {
  const adminId = req.admin.adminId;
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
                libraryId: submission.libraryId,
                type: submission.type,
                libraryTitle: submission.library?.title || null,
                materialType: submission.library?.materialType || null,
                submittedAt: submission.createdAt
            }))
        }
    });
});

const findSubmissionById = asyncWrapper(async (req, res) => {
    const found = req.found;
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
                libraryId: submission.libraryId,
                type: submission.type,
                libraryTitle: submission.library?.title || null,
                materialType: submission.library?.materialType || null,
                submittedAt: submission.createdAt
            }))
        }
    });

})

const markSubmission = asyncWrapper(async (req, res) => {
    const found = req.found;
    const studentSub = await student.findStudentById(found.studentId);
    const {marked, score} = req.body;
    
    // Calculate total points based on submission type
    let totalPoints = 0;
    let submissionTitle = '';
    
    if (found.type === 'library_material') {
        const library = require('../data_link/library_data_link');
        const libraryMaterial = await library.getLibraryById(found.libraryId);
        totalPoints = libraryMaterial?.maxPoints || libraryMaterial?.points || 0;
        submissionTitle = libraryMaterial?.title || 'Unknown';
    } else if (found.type === 'quiz') {
        const quiz = require('../data_link/quiz_data_link');
        const quizData = await quiz.getQuizById(found.quizId);
        totalPoints = quizData?.mark || 0;
        submissionTitle = `Quiz ${found.quizId}`;
    } else if (found.type === 'assignment') {
        const assignment = require('../data_link/assignment_data_link');
        const assignmentData = await assignment.getAssignmentById(found.assId);
        totalPoints = assignmentData?.mark || 0;
        submissionTitle = `Assignment ${found.assId}`;
    }
    
    // Calculate percentage and grade using the same system as generateWeeklyReport
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const grade = getGradingSystem().calculateGrade(percentage);
    
    // Update submission with score, grade, and percentage
    found.score = score;
    found.grade = grade;
    found.percentage = percentage;
    found.marked = marked;
    found.markedAt = new Date();
    
    // Update student's total score
    studentSub.totalScore += score;
    await studentSub.save();
    await found.save();
    
    // Get submission details for response
    let submissionDetails = {
        id: found.subId,
        type: found.type,
        mark: `${found.score}/${totalPoints}`,
        grade: found.grade,
        marked: found.marked,
        submissionTitle: submissionTitle
    };
    
    if (found.type === 'library_material') {
        const library = require('../data_link/library_data_link');
        const libraryMaterial = await library.getLibraryById(found.libraryId);
        submissionDetails.libraryTitle = libraryMaterial?.title || 'Unknown';
        submissionDetails.materialType = libraryMaterial?.materialType || 'Unknown';
    }
    
    return res.status(200).json({
        status: "success",
        message: `Submission marked successfully`,
        data: submissionDetails
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

// ==================== TOPIC REPORT GENERATION ====================

// Helper function to generate Excel report using ExcelJS
const generateExcelReport = async (reportData, topicName, session) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${topicName} - ${session}`);
    
    // Add headers
    worksheet.addRow(reportData.headers);
    
    // Add data rows
    reportData.data.forEach(row => {
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
    
    return workbook;
};

// Helper function to generate report data with topic order
const generateReportDataWithTopicOrder = async (libraries, students, topic, getQuizColumnName) => {
    const reportData = [];
    
    // Create column headers
    const headers = ['Student Name'];
    const hwColumns = [];
    const quizColumns = [];
    
    // Separate HW and Quiz materials
    libraries.forEach(lib => {
        if (lib.title.toLowerCase().includes('hw') || lib.title.toLowerCase().includes('homework')) {
            hwColumns.push(lib);
        } else if (lib.title.toLowerCase().includes('quiz')) {
            quizColumns.push(lib);
        }
    });
    
    // Add HW columns
    hwColumns.forEach((hw, index) => {
        headers.push(`Hw${index + 1}`);
    });
    
    // Add Quiz columns with Percentage and Grade using topic order
    const topicOrder = topic.order || 1;
    const quizColumnName = getQuizColumnName(topicOrder);
    headers.push(quizColumnName);
    headers.push(`${quizColumnName}_Percentage`);
    headers.push(`${quizColumnName}_Grade`);
    
    // Generate student rows
    for (const student of students) {
        const row = { name: student.studentName };
        
        // Get HW scores - Done or Missing
        for (let index = 0; index < hwColumns.length; index++) {
            const hw = hwColumns[index];
            const submission = await getStudentSubmission(hw.libraryId, student.studentId);
            row[`Hw${index + 1}`] = submission ? 'Done' : 'Missing';
        }
        
        // Get Quiz scores with Percentage and Grade
        if (quizColumns.length > 0) {
            const quiz = quizColumns[0]; // Take first quiz if multiple
            const submission = await getStudentSubmission(quiz.libraryId, student.studentId);
            
            if (submission) {
                // Student submitted and graded
                const score = submission.score || 0;
                const maxPoints = quiz.maxPoints || quiz.points || 100;
                const percentage = Math.round((score / maxPoints) * 100);
                const grade = getGradingSystem().calculateGrade(percentage);
                
                row[quizColumnName] = score;
                row[`${quizColumnName}_Percentage`] = percentage;
                row[`${quizColumnName}_Grade`] = grade;
            } else {
                // Student didn't submit
                row[quizColumnName] = '0';
                row[`${quizColumnName}_Percentage`] = '0';
                row[`${quizColumnName}_Grade`] = 'U';
            }
        }
        
        reportData.push(row);
    }
    
    return { headers, data: reportData };
};


const generateWeeklyReport = asyncWrapper(async (req, res) => {
    const { semester, topicId } = req.body;
    const adminId = req.admin.id;
    const adminName = req.admin.name;
    
    // Validate input
    if (!semester || !topicId) {
        return res.status(400).json({
            status: "error",
            message: "Semester and topicId are required"
        });
    }
    
    if (!['June', 'Nov'].includes(semester)) {
        return res.status(400).json({
            status: "error",
            message: "Semester must be either 'June' or 'Nov'"
        });
    }
    
    try {
        // Get topic details
        const library = require('../data_link/library_data_link');
        const topic = await library.getTopicById(topicId);
        
        if (!topic) {
            return res.status(404).json({
                status: "error",
                message: "Topic not found"
            });
        }
        
        // Get all libraries in this topic for the specified session
        const libraries = await library.getLibrariesByTopicAndSession(topicId, semester);
        
        if (!libraries || libraries.length === 0) {
            return res.status(404).json({
                status: "error",
                message: `No materials found for topic "${topic.title}" in ${semester} session`
            });
        }
        
        // Get admin's students only
        const adminStudents = await student.getStudentsByAdminId(adminId);
        
        if (!adminStudents || adminStudents.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No students found for this admin"
            });
        }
        
        // Determine quiz column name based on topic order (week number)
        const getQuizColumnName = (topicOrder) => {
            if (topicOrder % 4 === 0) {
                const mockNumber = topicOrder / 4;
                return `Mock ${mockNumber}`;
            } else {
                return `Quiz ${topicOrder}`;
            }
        };
        
        // Generate report data using the new logic with topic order
        const reportData = await generateReportDataWithTopicOrder(libraries, adminStudents, topic, getQuizColumnName);
        
        // Create Excel file using ExcelJS
        const workbook = await generateExcelReport(reportData, topic.title, semester);
        
        // Generate filename
        const filename = `${topic.title}_${semester}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // Set response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        // Send Excel file
        await workbook.xlsx.write(res);
        res.end();
        
    } catch (error) {
        console.error('Error generating report:', error);
        return res.status(500).json({
            status: "error",
            message: "Failed to generate report",
            error: error.message
        });
    }
});


// Helper function to get student submission
const getStudentSubmission = async (libraryId, studentId) => {
    const Submission = require('../models/submission_model');
    return await Submission.findOne({
        where: {
            libraryId: libraryId,
            studentId: studentId,
            type: 'library_material',
            marked: 'true'
        }
    });
};


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
    generateWeeklyReport,
    getGradingSystem
}

