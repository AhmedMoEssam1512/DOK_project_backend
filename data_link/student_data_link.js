const sequelize = require('../config/database');
const Student = require('../models/student_model');
const Admin = require('../models/admin_model');
const {where} = require("sequelize");
const Regection = require('../models/rejection_model.js');
const Registration = require('../models/registration_model.js');
const {verify} = require("jsonwebtoken");

function findStudentByEmail(studentEmail){
    return Student.findOne({where : { studentEmail } })
}

function showStudentInGroup(group){
    return Student.findAll({
        where: { group }
    });
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

module.exports={
    findStudentByEmail,
    showStudentInGroup,
    createStudent,
    registerStudent
}