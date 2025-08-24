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

const rejectSudent = asyncWrapper(async (req, res) => {
  const student = req.student; // must be set earlier by studentFound
  const adminId = req.admin.id;
  console.log(adminId) // assuming adminId is available in req.admin
  await regection.createRejection(student.studentEmail,adminId,student.semester);
  const reg = await registration.findRegistration(student.studentEmail);
  reg.rejectionCount += 1;
  await reg.save();
  const adminCount = await admin.Count(student.group);
  console.log("adminCount : ", adminCount);
  if (reg.rejectionCount >= adminCount) {
    await registration.registrationDestroy(student.studentEmail);
    await student.destroy();
    await regection.Destroy(student.studentEmail);
  }
  return res.status(200).json({
    status: "success",
    message: `Student ${student.studentName} rejected successfully`,
    data: { studentEmail: student.studentEmail }
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
    rejectSudent
}

