const sequelize = require('../config/database');
const Student = require('../models/student_model.js');
const student = require('../data_link/student_data_link');
const bcrypt = require('bcrypt');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const asyncWrapper = require('../middleware/asyncwrapper');
const jwt = require("jsonwebtoken");
const { notifyAssistants } = require('../utils/sseClients');
const Registration = require('../models/registration_model.js');


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



module.exports = {
    studentRegister,
}