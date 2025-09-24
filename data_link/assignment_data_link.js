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

function getAssignmentById(assignmentId){
    return Assignment.findOne({ where: { assignmentId } });
}

function createSubmission(assignmentId, studentId, assistantId, answers, semester){
    return Submission.create({ assId: assignmentId, studentId, assistantId, answers, semester, "type":"assignment" })
}

function findSubmissionByQuizAndStudent(assignmentId, studentId){
    return Submission.findOne({ where: { assId: assignmentId, studentId } })
}

function findSubmissionByAssignmentAndStudent(assignId, studentId) {
  return Submission.findOne({
    where: {
      assignId,
      studentId,
      type: 'assignment'   // make sure it's assignment
    }
  });
}

module.exports={
    createAssignment,
    getAllAssignments,
    getAllAssignmentsByGroup,
    getAssignmentById,
    createSubmission,
    findSubmissionByQuizAndStudent,
    findSubmissionByAssignmentAndStudent
}