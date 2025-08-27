const sequelize = require('../config/database');
const Quiz = require('../models/quiz_model.js');

const createQuiz = async ({mark,publisher,quizPdf,date,semester,durationInMin}) => {
    return Quiz.create({mark,publisher,quizPdf,date,semester,durationInMin});
};

module.exports = {
     createQuiz,
     };