const sequelize = require('../config/database');
const Student = require('../models/student_model.js');
const student = require('../data_link/student_data_link');
const admin = require('../data_link/admin_data_link.js');
const session = require('../data_link/session_data_link.js');
const bcrypt = require('bcrypt');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const asyncWrapper = require('../middleware/asyncwrapper');
const { getCache } = require("../utils/cache");
const { setCache } = require("../utils/cache");
const jwt = require("jsonwebtoken");
const sse = require('../utils/sseClients.js');

const createSession = asyncWrapper(async (req, res) => {
  const { number, semester, dateAndTime, link } = req.body;
  const adminId = req.admin.id;
  const adminGroup = req.admin.group; // 👈 "all" or specific group
  const adminN = await admin.findAdminById(adminId);
  const adminName = adminN.name;
  await admin.createSession(number, semester, dateAndTime, adminId, link);

   sse.notifyStudents(adminGroup, {
        event: "New Session Date",
        message: `Group ${adminGroup}, a date for the upcoming session has been dropped by ${adminName}. Please check your dashboard.`,
        post: {
            number: number,
            semester: semester,
            dateAndTime: dateAndTime,
            link: link
        },
      });
  return res.status(201).json({
    status: "success",
    data: { message: "Session created successfully" }
  })});

const attendSession = asyncWrapper(async (req, res, next) => {
    const { sessionId } = req.params;
    const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    const studentId = decoded.id;
    const studentSem = await student.findStudentById(studentId);
    const sem = studentSem.semester;
    await student.createAttendance(studentId, sessionId, sem);

    return res.status(200).json({
        status: "success",
        data: { message: "Attendance recorded successfully" }
    })});

const startSession = asyncWrapper(async (req, res) => {
    const { sessionId } = req.params;
    const adminGroup = req.admin.group; // 👈 "all" or specific group
    
    const sessionsData = await session.findSessionById(sessionId);
    
    await session.UpdateSession(sessionId, new Date());

    const cacheKey = `activeSession:${adminGroup}`;

    setCache(cacheKey, sessionsData, 9000);

    sse.notifyStudents(adminGroup, {
        event: "Session Started",
        message: `Group ${adminGroup}, the session has started. Please join using the provided link.`,
        post: {
            sessionId: sessionsData.sessionId,
            link: sessionsData.link,
            dateAndTime: sessionsData.dateAndTime
        },
        });
    return res.status(200).json({
        status: "success",
        data: { message: "Session started and students notified" }
    })});

module.exports = {
    createSession,
    attendSession,
    startSession
}