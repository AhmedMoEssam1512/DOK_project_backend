const sequelize = require('../config/database');
const { Op } = require("sequelize");
const Assignment = require('../models/assignment_model');
const Admin = require('../models/admin_model');
const Submission = require('../models/submission_model');

Assignment.belongsTo(Admin, { foreignKey: "publisher" });

function createAssignment(mark, document, startDate, endDate, semester, publisher){
    return Assignment.create(
        {mark, document, startDate, endDate, semester,publisher})
}

function getAllAssignments() {
    return Assignment.findAll();
}

async function getAllAssignmentsByGroup(group) {
    return await Assignment.findAll({
        include: [
            {
                model: Admin,
                attributes: ["group"],
                where: {
                    [Op.or]: [
                        { group: group },
                        { group: "all" }
                    ]
                }
            }
        ]
    });
}

function getAssignmentById(assignId){
    return Assignment.findOne({where : {assignId}});
}

function createSubmission(assId, studentId,publisher,answers, semester){
    return Submission.create({assId, studentId, publisher, answers, semester, "type":"assignment"})
}

function findSubmissionByQuizAndStudent(assId,studentId){
    return Submission.findOne({where: {assId,studentId}})
}

module.exports={
    createAssignment,
    getAllAssignments,
    getAllAssignmentsByGroup,
    getAssignmentById,
    createSubmission,
    findSubmissionByQuizAndStudent,
}