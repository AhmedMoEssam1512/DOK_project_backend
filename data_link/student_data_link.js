const sequelize = require('../config/database');
const Student = require('../models/student_model');
const Admin = require('../models/admin_model');
const {where} = require("sequelize");
const Rejection = require('../models/rejection_model.js');
const Registration = require('../models/registration_model.js');
const Attendance = require('../models/attendance_model.js');
const {verify} = require("jsonwebtoken");

function findStudentByEmail(studentEmail){
    return Student.findOne({where : { studentEmail } })
}

function registerStudent(studentEmail, group){
    return Registration.create({
        studentEmail,
        group});
}

function createStudent(studentName,studentEmail,password,parentEmail,birthDate,
                       studentPhoneNumber,parentPhoneNumber,group,semester)
{
    return Student.create({
        studentName,
        studentEmail,
        password,
        parentEmail,
        birthDate,
        studentPhoneNumber,
        parentPhoneNumber,
        group,
        semester
    });
};

function findStudentById(studentId){
    return Student.findOne({where : { studentId } })
}

function createAttendance(studentId, sessionId, semester) {
    return Attendance.create({
        studentId,
        recordedAt: new Date(),
        semester,
        sessionId
    });
}

function findAttendanceByStudentAndSession(studentId, sessionId) {
    return Attendance.findOne({ 
        where: { 
            studentId: studentId.toString(), 
            sessionId: sessionId.toString() 
        } 
    });
}

module.exports={
    findStudentByEmail,
    createStudent,
    registerStudent,
    findStudentById,
    createAttendance,
    findAttendanceByStudentAndSession
}