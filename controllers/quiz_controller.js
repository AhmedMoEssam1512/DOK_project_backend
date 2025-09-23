const Quiz = require('../models/quiz_model');
const Topic = require('../models/topic_model');
const Submission = require('../models/submission_model');
const { asyncWrapper } = require('../middleware/asyncwrapper');
const AppError = require('../utils/app.error');
const dueDateManager = require('../utils/dueDateManager');
const admin = require('../data_link/admin_data_link');

// Create Quiz
const createQuiz = asyncWrapper(async (req, res) => {
  const quizData = req.body;
  const adminId = req.admin.adminId;
  
  // Add adminId to quiz data
  quizData.adminId = adminId;
  
  // Auto-increment order based on existing quizzes for the same topic
  if (quizData.topicId) {
    const lastQuiz = await Quiz.findOne({
      where: { 
        topicId: quizData.topicId,
        isActive: true 
      },
      order: [['order', 'DESC']]
    });
    
    quizData.order = lastQuiz ? lastQuiz.order + 1 : 1;
  }
  
  const newQuiz = await Quiz.create(quizData);
  
    return res.status(201).json({
    status: "success",
    message: "Quiz created successfully",
    data: {
      quiz: newQuiz
    }
    });
});

// Get All Quizzes
const getAllQuizzes = asyncWrapper(async (req, res) => {
  const { topicId, semester, isPublished } = req.query;
  
  const whereClause = { isActive: true };
  
  if (topicId) whereClause.topicId = topicId;
  if (semester) whereClause.semester = semester;
  if (isPublished !== undefined) whereClause.isPublished = isPublished === 'true';
  
  const quizzes = await Quiz.findAll({
    where: whereClause,
    order: [['order', 'ASC']]
  });
  
  // Add adminName to publisher field for each quiz
  const quizzesWithPublisher = quizzes.map(quiz => ({
    ...quiz.dataValues,
    publisher: req.admin.adminName
  }));
  
  return res.status(200).json({
    status: "success",
    message: "Quizzes retrieved successfully",
    data: {
      count: quizzesWithPublisher.length,
      quizzes: quizzesWithPublisher
    }
  });
});

// Get Quiz by ID
const getQuizById = asyncWrapper(async (req, res) => {
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
  
  // Add adminName to publisher field
  const quizResponse = {
    ...quiz.dataValues,
    publisher: req.admin.adminName
  };
  
  return res.status(200).json({
    status: "success",
    message: "Quiz retrieved successfully",
    data: {
      quiz: quizResponse
    }
  });
});

// Update Quiz
const updateQuiz = asyncWrapper(async (req, res) => {
  const { quizId } = req.params;
  const updateData = req.body;
  
  const quiz = await Quiz.findOne({
    where: { quizId, isActive: true }
  });
  
  if (!quiz) {
    return res.status(404).json({
      status: "error",
      message: "Quiz not found"
    });
  }
  
  // Update quiz
  await quiz.update(updateData);
  
  // Add adminName to publisher field
  const quizResponse = {
    ...quiz.dataValues,
    publisher: req.admin.adminName
  };
  
  return res.status(200).json({
    status: "success",
    message: "Quiz updated successfully",
    data: {
      quiz: quizResponse
    }
  });
});

// Delete Quiz
const deleteQuiz = asyncWrapper(async (req, res) => {
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
  
  // Soft delete
  await quiz.update({ isActive: false });
  
  // Add adminName to publisher field
  const quizResponse = {
    ...quiz.dataValues,
    publisher: req.admin.adminName
  };
  
  return res.status(200).json({
    status: "success",
    message: "Quiz deleted successfully",
    data: {
      quiz: quizResponse
    }
  });
});

// Publish Quiz
const publishQuiz = asyncWrapper(async (req, res) => {
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
  
  await quiz.update({ 
    isPublished: true, 
    publishedAt: new Date()
  });
  
  // Add adminName to publisher field
  const quizResponse = {
    ...quiz.dataValues,
    publisher: req.admin.adminName
  };
  
  return res.status(200).json({
    status: "success",
    message: "Quiz published successfully",
    data: {
      quiz: quizResponse
    }
  });
});


module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById, 
  updateQuiz,
  deleteQuiz,
  publishQuiz
};