const sequelize = require('../config/database');
const { Op } = require("sequelize");
const Quiz = require('../models/quiz_model');
const Admin = require('../models/admin_model');

Quiz.belongsTo(Admin, { foreignKey: "publisher" });


function createQuiz(mark,publisher,quizPdf,date,semester,durationInMin) {
    return Quiz.create({mark,publisher,quizPdf,date,semester,durationInMin});
};

function getAllQuizzes(){
    return Quiz.findAll();
};

async function getAllQuizzesForGroup(group) {
  return await Quiz.findAll({
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


module.exports = {
     createQuiz,
    getAllQuizzes,
    getAllQuizzesForGroup
};