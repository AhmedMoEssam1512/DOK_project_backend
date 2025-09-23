const sequelize = require('../config/database');
const Admin = require('../models/admin_model.js');
const Student = require('../models/student_model.js');
const Quiz = require('../models/quiz_model.js');
const Assignment = require('../models/assignment_model.js');
const Submission = require('../models/submission_model.js');
const Session = require('../models/session_model.js');
const Attendance = require('../models/attendance_model.js');
const Feed = require('../models/feed_model.js');
const Registration = require('../models/registration_model.js');
const admins = require('../data_link/admin_data_link');
const bcrypt = require('bcrypt');
const AppError = require('../utils/app.error');
const  asyncWrapper  = require('../middleware/asyncwrapper');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const path = require('path');

const DOK_signUp= asyncWrapper( async (req, res) => {
    const { email, name, password, phonenumber, role = "teacher", permission = "all" } = req.body;

    // hash password
    const encryptedPassword = await bcrypt.hash(String(password), 10);

    // create admin
    await Admin.create({
      email,
      name,
      password: encryptedPassword,
      phoneNumber: phonenumber,
      group: "all", // matches model field
      role,
      permission,
      verified: true,
    });
    return res.status(201).json({
      status: "success" ,
      data: { message: "Teacher created successfully" }
    });
})

const rejectAssistant = asyncWrapper(async (req, res) => {
    const { email } = req.params;
    const assistant = await admins.findAdminByEmail(email);
    await admins.removeAssistant( email  );
    return res.status(200).json({
    status: "success",
    message: `Assistant with email ${email} rejected and removed from database`
  });
});

const acceptAssistant = asyncWrapper(async (req, res) => {
    const { email } = req.params;
    const assistant = await admins.findAdminByEmail( email );
    await admins.verifyAssistant( email );
    return res.status(200).json({
        status: "success",
        message: `Assistant with email ${email} accepted`
    });
})

const showPendingRegistration = asyncWrapper(async (req, res) => {
    const admin = await admins.showPendingAdminRegistration();
    return res.status(200).json({
        status: "success",
        message: `Pending registration from assistants`,
        data: { 
  data: admin.map(admin => ({
      name: admin.name,
      email: admin.email,
      group: admin.group
    }))
}})})

const removeAssistant = asyncWrapper(async (req, res) => {
    const { email } = req.params;
    const deleted = await admins.removeAssistant(email);
    return res.status(200).json({
        status: "success",
        message: `Assistant with email ${email} removed successfully`
    })
})

const checkAssistantGroup = asyncWrapper(async (req, res) => {
    const { group } = req.params;
    const admin = await admins.checkAssistantGroup( group );
    return res.status(200).json({
        status: "success",
        data: {
            data: admin.map(admin => ({
                name: admin.name,
                email: admin.email
            }))
        }
    });
});

const assignGroupToAssistant = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { group } = req.body;
    const assistant = await admins.findAdminById(id);
    if (!assistant) {
        return next(new AppError('Assistant not found', 404));
    }
    assistant.group = group;
    await assistant.save();
    return res.status(200).json({
        status: "success",
        message: `Group ${group} assigned to assistant ${assistant.name} successfully`
    });
});

// ==================== TOPIC REPORT GENERATION FOR DOK ====================

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


const generateWeeklyReportDOK = asyncWrapper(async (req, res) => {
    const { semester, topicId } = req.body;
    const dokId = req.dok.id;
    
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
        
        // Get DOK's students only
        const student = require('../data_link/student_data_link');
        const dokStudents = await student.getStudentsByDokId(dokId);
        
        if (!dokStudents || dokStudents.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No students found for this DOK"
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
        const reportData = await generateReportDataWithTopicOrderDOK(libraries, dokStudents, topic, getQuizColumnName);
        
        // Create Excel file using ExcelJS
        const workbook = await generateExcelReportDOK(reportData, topic.title, semester);
        
        // Generate filename
        const filename = `${topic.title}_${semester}_DOK_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        
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


// Helper function to generate Excel report using ExcelJS for DOK
const generateExcelReportDOK = async (reportData, topicName, session) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${topicName} - ${session} (DOK)`);
    
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

// Helper function to generate report data with topic order for DOK
const generateReportDataWithTopicOrderDOK = async (libraries, students, topic, getQuizColumnName) => {
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
            const submission = await getStudentSubmissionDOK(hw.libraryId, student.studentId);
            row[`Hw${index + 1}`] = submission ? 'Done' : 'Missing';
        }
        
        // Get Quiz scores with Percentage and Grade
        if (quizColumns.length > 0) {
            const quiz = quizColumns[0]; // Take first quiz if multiple
            const submission = await getStudentSubmissionDOK(quiz.libraryId, student.studentId);
            
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
        } else {
            // No quiz found
            row[quizColumnName] = 'No Quiz';
            row[`${quizColumnName}_Percentage`] = '-';
            row[`${quizColumnName}_Grade`] = '-';
        }
        
        reportData.push(row);
    }
    
    return { headers, data: reportData };
};

// Helper function to get student submission for DOK
const getStudentSubmissionDOK = async (libraryId, studentId) => {
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
    DOK_signUp, 
    rejectAssistant,
    acceptAssistant,
    showPendingRegistration,
    removeAssistant,
    checkAssistantGroup,
    assignGroupToAssistant,
    generateWeeklyReportDOK
}