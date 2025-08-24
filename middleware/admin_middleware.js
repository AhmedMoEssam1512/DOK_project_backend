const sequelize = require('../config/database');
const Admin = require('../models/admin_model.js');
const Student = require('../models/student_model.js');
const Regection = require('../models/rejection_model.js');
const regection = require('../data_link/admin_data_link');
const bcrypt = require('bcrypt');
const httpStatus = require('../utils/http.status');
const AppError = require('../utils/app.error');
const asyncWrapper = require('./asyncwrapper');
const {where} = require("sequelize");
const jwt = require("jsonwebtoken");
const { addClient } = require('../utils/sseClients');
const student = require('../data_link/student_data_link.js');
const admin = require('../data_link/admin_data_link.js');

const adminFound= asyncWrapper(async (req, res, next) => {
    const { email, studentEmail } = req.body;
    const adFound = await admin.findAdminByEmail(email);
    if (adFound) {
        const error = AppError.create("Email already exists", 400, httpStatus.Error);
        return next(error);
    }
    const stdFound = await student.findStudentByEmail(email);
    if (stdFound) {
        const error = AppError.create("Email already exists", 400, httpStatus.Error);
        return next(error);
    }
    next();
})

const studentFound = asyncWrapper(async (req, res, next) => {
    const { studentEmail } = req.params;
    const found = await student.findStudentByEmail(studentEmail);
    if (!found) {
    return next(new AppError('student not found', 404));
  }
  if(found.group !== req.admin.group) {
    return next(new AppError('You are not allowed to access this student', 403));
  }
  if (found.verified) {
    return next(new AppError('Student already verified', 400));
  }
  req.student = found;
  console.log("student found : ", studentEmail) // attach found admin for later use
  next();
});

const passwordEncryption = asyncWrapper( async (req,res,next) => {
    const { password } = req.body;
    const encryptedPassword = await bcrypt.hash(String(password),10);
    req.body.password = encryptedPassword;
    next();
});

const checkAuthurity = asyncWrapper(async (req, res, next) => {
    const admin = req.admin; // must be set earlier by findAndCheckAdmin
   const { studentEmail } = req.params;
    const found = await student.findStudentByEmail(studentEmail);
    if (!found) {
    return next(new AppError('student not found', 404));
  }
  if(String(found.assistantId) !== String(req.admin.id) && req.admin.id !== 1) {
    console.log("found.assistantId : ", found.assistantId)
    console.log("req.admin.id : ", req.admin.id)
    return next(new AppError('You are not allowed to access this student', 403));
  }
  req.student = found;
  console.log("student found : ", studentEmail)
    next();
});



const canReject = asyncWrapper(async (req, res, next) => {
  const {studentEmail }= req.params
  const adminId= req.admin.id;
  console.log("email and adminId : ", studentEmail, adminId)
  const reg = await regection.findByEmailAndId(email,adminId);
  console.log("reg : ", reg)
  if (reg) {
    return next(new AppError('Can not reject student twice', 404));
    return next(error)
  }
  console.log("canReject chack done ")
  next();
});

const establishConnection = asyncWrapper(async (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Unauthorized: No admin found" });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // Confirm connection event
  res.write("event: connected\n");
  res.write(`data: ${JSON.stringify({
    message: "SSE connection established",
    admin: {
      id: req.admin.id,
      email: req.admin.email,
      role: req.admin.role,
      group: req.admin.group,
    },
  })}\n\n`);

  // Add admin to the SSE clients pool
  addClient(res, req.admin.email, req.admin.role, req.admin.group);

  // Heartbeat to keep connection alive
  const hb = setInterval(() => {
    res.write(": ping\n\n");
  }, 25000);

  // Handle connection close
  req.on("close", () => {
    clearInterval(hb);
    removeClient(res); // 👈 you need this function in your pool manager
  });
});


module.exports = {
    adminFound,
    passwordEncryption,
    establishConnection,
    studentFound,
    checkAuthurity,
    canReject
}