const sequelize = require('../config/database');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const asyncWrapper = require('../middleware/asyncwrapper');
const Quiz = require('../models/quiz_model.js');
const quiz = require('../data_link/quiz_data_link.js');
const admin = require('../data_link/admin_data_link.js');
const student = require('../data_link/student_data_link.js');
const Admin = require('../models/admin_model.js');
const Student = require('../models/student_model.js');

const checkFields = asyncWrapper(async (req, res, next) => {
    const {mark,quizPdf,date,semester,durationInMin} = req.body;

    if (mark == null || quizPdf == null || date == null || semester == null || durationInMin == null) {
        return next(new AppError("All fields are required", httpStatus.BAD_REQUEST));
    }

    if (typeof mark !== 'number' || mark < 0) {
        return next(new AppError("Mark must be a non-negative number", httpStatus.BAD_REQUEST));
    }

     // quizPdf must be a valid URL ending with .pdf
    const pdfRegex = /^https?:\/\/.+\.pdf$/i;
    if (typeof quizPdf !== 'string' || !pdfRegex.test(quizPdf.trim())) {
        return next(new AppError("Quiz PDF must be a valid link ending with .pdf", httpStatus.BAD_REQUEST));
    }

    // allow any date format that JS Date can parse
    const parsedDate = new Date(date);
    if (parsedDate.toString() === "Invalid Date") {
        return next(new AppError("Invalid date format", httpStatus.BAD_REQUEST));
    }

    if (typeof semester !== 'string' || semester.trim() === '') {
        return next(new AppError("Semester must be a non-empty string", httpStatus.BAD_REQUEST));
    }

    if (typeof durationInMin !== 'number' || durationInMin <= 0) {
        return next(new AppError("Duration must be a positive number", httpStatus.BAD_REQUEST));
    }

    next();
});

module.exports = {
    checkFields     
};