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

const createAssignment = asyncWrapper(async (req, res) => {
    const {mark, document, startDate, endDate, semester}= req.body;
    const publisher = req.admin.id;
    const createdAssignment = await assignment.createAssignment
    (mark, document, startDate, endDate, semester, publisher)
    return res.status(201).json({
        status: "success" ,
        data: { message: "assignment created successfully", assignmentId: createdAssignment.assignId },
    });
});

module.exports={
    createAssignment
}

