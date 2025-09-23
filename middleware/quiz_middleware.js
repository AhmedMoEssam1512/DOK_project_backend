const Quiz = require('../models/quiz_model');
const { asyncWrapper } = require('./asyncwrapper');

const quizExists = asyncWrapper(async (req, res, next) => {
  const { quizId } = req.params;
  
  const quiz = await Quiz.findOne({
    where: { quizId, isActive: true }
  });
  
  if (!quiz) {
    return res.status(404).json({
      status: "error",
      message: "Quiz not found"
    });
  }
  
  req.quiz = quiz;
  next();
});

module.exports = {
  quizExists
};