const sequelize = require('../config/database');
const Student = require('../models/student.model.js');
const bcrypt = require('bcrypt');
const httpStatus = require('../utils/http.status');
const AppError = require('../utils/app.error');
const asyncWrapper = require('../middleware/async.wrapper');
const {where} = require("sequelize");
const jwt = require("jsonwebtoken");

const studentFound= asyncWrapper(async (req, res, next) => {
    const { studentEmail } = req.body;
    const found = await Student.findOne({ where: { studentEmail } });
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
    const found = await Student.findOne( {where: { email } });
    if (!found){
        const error = AppError.create("Email not found", 404 , httpStatus.Error);
        return next(error)
    }
    const valid = await bcrypt.compare(String(password),found.password);
    if(!valid){
        const error = AppError.create("Invalid password", 401, httpStatus.Error);
        return next(error);
    }
    const verified = found.verified;
    if(!verified){
        const error = AppError.create("Email not verified", 403, httpStatus.Error);
        return next(error);
    }
    const banned = found.banned;
    if (!banned){
        const error = AppError.create("Your account is banned",403,httpStatus.Error);
        return next(error);
    }
    req.student = found;
    next();
})


module.exports = {
    studentFound,
    passwordEncryption,
    findAndCheckStudent,
}