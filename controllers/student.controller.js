const sequelize = require('../config/database');
const Student = require('../models/student.model.js');
const bcrypt = require('bcrypt');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const asyncWrapper = require('../middleware/async.wrapper');

const studentRegister = asyncWrapper(async (req, res) => {
    const {studentEmail,studentName,password,studentPhoneNumber,parentPhoneNumber,group,semester} = req.body;
    await Student.create({
        studentName,
        studentEmail,
        password,
        studentPhoneNumber,
        parentPhoneNumber,
        group,
        semester
    });
    return res.status(201).json({
        status: "success" ,
        data: { message: "Student created successfully" }
    });
});

const signIn = asyncWrapper(async (req, res, next) => {
    const student = req.student; // must be set earlier by findAndCheckAdmin
    const studentToken = jwt.sign(
        {
            id: student.studentId,
            email: student.studentEmail,
        },
        process.env.JWT_SECRET, // 👈 must match protect middleware
        { expiresIn: process.env.JWT_EXPIRATION } // fallback if not set
    );

    res.status(200).json({
        status: "success",
        message: "Login successful",
        token: studentToken, // standardized key name
    });
});

module.exports = {
    studentRegister,
    signIn,
}