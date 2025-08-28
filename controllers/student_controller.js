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

module.exports = {
    studentRegister,
    showMyAdminProfile,
    showMyProfile,
    getMyFeed,
}