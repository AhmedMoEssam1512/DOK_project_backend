const sequelize = require('../config/database');
const Admin = require('../models/admin.model.js');
const Student = require('../models/student.model.js');
const bcrypt = require('bcrypt');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const asyncWrapper = require('../middleware/async.wrapper');
const jwt = require("jsonwebtoken");
const Regection = require('../models/rejection.model.js');
const Registration = require('../models/registration.model.js');


const TARegister = asyncWrapper(async (req, res) => {
    const { email, name, password, phoneNumber, group} = req.body;
    const encryptedPassword = await bcrypt.hash(String(password), 10);
    await Admin.create({
        email,
        name,
        password,
        phoneNumber,
        group,
        role: "assistant",
        permission:"limited",
    });
    return res.status(201).json({
        status: "success" ,
        data: { message: "Assistant created successfully" }
    });
});

const signIn = asyncWrapper(async (req, res, next) => {
  const admin = req.admin; // must be set earlier by findAndCheckAdmin
  const adminToken = jwt.sign(
    {
      id: admin.adminId,
      email: admin.email,
      role: admin.role,
      group: admin.group,  
      permission: admin.permission,
    },
    process.env.JWT_SECRET, // 👈 must match protect middleware
    { expiresIn: process.env.JWT_EXPIRATION } // fallback if not set
  );

  res.status(200).json({
    status: "success",
    message: "Login successful",
    token: adminToken, // standardized key name
  });
});


const showPendingRegistration = asyncWrapper(async (req, res) => {
  const TAGroup = req.admin.group;
    const students = await Student.findAll({
        where: {verified : false , group: TAGroup}
    });
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
  await Regection.destroy({
    where: { studentEmail: student.studentEmail}});
  await Registration.destroy({
    where: { studentEmail: student.studentEmail }});
  return res.status(200).json({ 
    status: "success",
    message: `Student ${student.studentName} verified successfully`,
    data: { studentEmail: student.studentEmail }
  });
});

const showStudentInGroup = asyncWrapper(async (req, res) => {
    const { group } = req.params;
    const student = await Student.findAll({
        where: { group }
    });
    return res.status(200).json({
        status: "success",
        data: {
            data: student.map(student => ({
                name: student.studentName,
                email: student.studentEmail
            }))
        }
    });
});


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
    message: `Student ${student.studentName} deleted successfully`,
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
  await Regection.create({
    studentEmail: student.studentEmail,
    adminId : adminId,
    semester: student.semester,
    dateAndTime: new Date(),
  });
  const reg = await Registration.findOne({
    where: { studentEmail: student.studentEmail }
  });
  reg.rejectionCount += 1;
  await reg.save();
  const adminCount = await Admin.count({
    where: { group: student.group }
  });
  console.log("adminCount : ", adminCount);
  if (reg.rejectionCount >= adminCount) {
    await Registration.destroy({
      where: { studentEmail: student.studentEmail }
    });
    await student.destroy();
  }
  return res.status(200).json({
    status: "success",
    message: `Student ${student.studentName} rejected successfully`,
    data: { studentEmail: student.studentEmail }
  });
});

module.exports = {
    TARegister,
    signIn,
    showPendingRegistration,
    showStudentInGroup,
    verifyStudent,
    removeStudent,
    banStudent,
    unBanStudent,
    rejectSudent
}

