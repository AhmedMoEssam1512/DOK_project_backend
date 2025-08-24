const sequelize = require('../config/database');
const bcrypt = require('bcrypt');
const httpStatus = require('../utils/http.status');
const AppError = require('../utils/app.error');
const asyncWrapper = require('../middleware/async.wrapper');
const {where} = require("sequelize");
const jwt = require("jsonwebtoken");
const student = require('../data_link/student_data_link');

const studentFound= asyncWrapper(async (req, res, next) => {
    const { studentEmail } = req.body;
    const found = await student.findStudentByEmail(studentEmail);
    if (found) {
        const error = AppError.create("Email already exists", 400, httpStatus.Error);
        return next(error);
    }
    next();
})

const passwordEncryption = asyncWrapper( async (req,res,next) => {
    const { password } = req.body;
    const encryptedPassword = await bcrypt.hash(String(password),10);
    req.body.password = encryptedPassword;
    next();
});

const findAndCheckStudent = asyncWrapper(async (req,res, next ) => {
    const { email, password} = req.body;
    const found = await student.findStudentByEmail(email);
    if (!found){
        const error = AppError.create("Email not found", 404 , httpStatus.Error);
        return next(error)
    }
    console.log("Student found successfully" , found.studentEmail);
    const valid = await bcrypt.compare(String(password),found.password);
    if(!valid){
        const error = AppError.create("Wrong password", 401, httpStatus.Error);
        return next(error);
    }
    const verified = found.verified;
    if(!verified){
        const error = AppError.create("Email not verified", 403, httpStatus.Error);
        return next(error);
    }
    const banned = found.banned;
    if (banned){
        const error = AppError.create("Your account is banned",403,httpStatus.Error);
        return next(error);
    }
    req.student = found;
    console.log("Student found and checked successfully");
    next();
})


module.exports = {
    studentFound,
    passwordEncryption,
    findAndCheckStudent,
}