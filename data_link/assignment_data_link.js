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


module.exports={
    createAssignment,
    getAllAssignments,
    getAllAssignmentsByGroup,
}