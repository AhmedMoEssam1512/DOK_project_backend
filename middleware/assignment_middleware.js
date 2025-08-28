const sequelize = require('../config/database');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const asyncWrapper = require('../middleware/asyncwrapper');
const Assignment = require('../models/assignment_model.js');
const assignment = require('../data_link/assignment_data_link.js');
const admin = require('../data_link/admin_data_link.js');
const student = require('../data_link/student_data_link.js');
const Admin = require('../models/admin_model.js');
const Student = require('../models/student_model.js');

const checkField = asyncWrapper(async (req, res, next) => {
    const {mark, document, startDate, endDate, semester}= req.body;
    if (mark == null || document == null || startDate == null || semester == null || endDate == null) {
        return next(new AppError("All fields are required", httpStatus.BAD_REQUEST));
    }
    console.log("chack 1 done, all fields present")

    if (typeof mark !== 'number' || mark < 0) {
        return next(new AppError("Mark must be a non-negative number", httpStatus.BAD_REQUEST));
    }
    console.log("chack 2 done, mark valid")

    // quizPdf must be a valid URL ending with .pdf
    const pdfRegex = /^https?:\/\/.+\.pdf$/i;
    if (typeof document !== 'string' || !pdfRegex.test(document.trim())) {
        return next(new AppError("Assignment PDF must be a valid link ending with .pdf", httpStatus.BAD_REQUEST));
    }
    console.log("chack 3 done, pdf valid")

    // allow any date format that JS Date can parse
    const parsedDate = new Date(startDate);
    if (parsedDate.toString() === "Invalid Date") {
        return next(new AppError("Invalid date format", httpStatus.BAD_REQUEST));
    }
    console.log("chack 4 done, start date valid")

    const parsedDate2 = new Date(endDate);
    if (parsedDate2.toString() === "Invalid Date") {
        return next(new AppError("Invalid date format", httpStatus.BAD_REQUEST));
    }
    console.log("chack 5 done, end date valid")

    if (parsedDate2 <= parsedDate) {
        return next(new AppError("End date must be after start date", httpStatus.BAD_REQUEST));
    }
    console.log("check 6 done, end date is after start date");

    if (typeof semester !== 'string' || semester.trim() === '') {
        return next(new AppError("Semester must be a non-empty string", httpStatus.BAD_REQUEST));
    }
    console.log("chack 7 done, semester valid")
    next();
})

module.exports = {
    checkField
}