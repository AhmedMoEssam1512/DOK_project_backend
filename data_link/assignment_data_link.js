const sequelize = require('../config/database');
const { Op } = require("sequelize");
const Assignment = require('../models/assignment_model');
const Admin = require('../models/admin_model');
const Submission = require('../models/submission_model');

function createAssignment(mark, document, startDate, endDate, semester, publisher){
    return Assignment.create(
        {mark, document, startDate, endDate, semester,publisher})
}

module.exports={
    createAssignment,
}