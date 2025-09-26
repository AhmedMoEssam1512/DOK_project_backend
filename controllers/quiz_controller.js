const Quiz = require('../models/quiz_model');
const Topic = require('../models/topic_model');
const Submission = require('../models/submission_model');
const  asyncWrapper  = require('../middleware/asyncwrapper');
const AppError = require('../utils/app.error');
const admin = require('../data_link/admin_data_link');

// Helper to add admin name to publisher field and format createdAt to Cairo time
function addPublisherToQuiz(quizInstance, adminName) {
  if (!quizInstance) return quizInstance;
  const quiz = quizInstance.toJSON ? quizInstance.toJSON() : quizInstance;
  const toCairoISO = (date) => {
    if (!date) return date;
    try {
      const s = new Date(date).toLocaleString('sv-SE', { timeZone: 'Africa/Cairo' });
      return s.replace(' ', 'T');
    } catch (_) {
      return date;
    }
  };
  return {
    ...quiz,
    publisher: adminName,
    createdAt: toCairoISO(quiz.createdAt)
  };
}

// Create Quiz
const createQuiz = asyncWrapper(async (req, res) => {
  const quizData = req.body;
  const adminId = req.admin.id;
  
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
      quiz: addPublisherToQuiz(newQuiz, req.admin.name)
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
    order: [['order', 'ASC']],
  });
  
  return res.status(200).json({
    status: "success",
    message: "Quizzes retrieved successfully",
    data: {
      count: quizzes.length,
      quizzes: quizzes.map(quiz => addPublisherToQuiz(quiz, req.admin.name))
    }
  });
});

// Get Quiz by ID
const getQuizById = asyncWrapper(async (req, res) => {
  const { quizId } = req.params;
  
  const quiz = await Quiz.findOne({
    where: { quizId, isActive: true },
  });
  
  if (!quiz) {
    return res.status(404).json({
      status: "error",
      message: "Quiz not found"
    });
  }
  
  return res.status(200).json({
    status: "success",
    message: "Quiz retrieved successfully",
    data: {
      quiz: addPublisherToQuiz(quiz, req.admin.name)
    }
  });
});

// Update Quiz
const updateQuiz = asyncWrapper(async (req, res) => {
  const { quizId } = req.params;
  const updateData = req.body;
  
  const quiz = await Quiz.findOne({
    where: { quizId, isActive: true },
  });
  
  if (!quiz) {
    return res.status(404).json({
      status: "error",
      message: "Quiz not found"
    });
  }
  
  // Update quiz
  await quiz.update(updateData);
  
  return res.status(200).json({
    status: "success",
    message: "Quiz updated successfully",
    data: {
      quiz: addPublisherToQuiz(quiz, req.admin.name)
    }
  });
});

// Delete Quiz
const deleteQuiz = asyncWrapper(async (req, res) => {
  const { quizId } = req.params;
  
  const quiz = await Quiz.findOne({
    where: { quizId, isActive: true },
  });
  
  if (!quiz) {
    return res.status(404).json({
      status: "error",
      message: "Quiz not found"
    });
  }
  
  // Soft delete
  await quiz.update({ isActive: false });
  
  return res.status(200).json({
    status: "success",
    message: "Quiz deleted successfully",
    data: {
      quiz: addPublisherToQuiz(quiz, req.admin.name)
    }
  });
});

// Publish Quiz
const publishQuiz = asyncWrapper(async (req, res) => {
  const { quizId } = req.params;
  
  const quiz = await Quiz.findOne({
    where: { quizId, isActive: true },
  });

  quiz.startedAt = new Date();
  await quiz.save();
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
  
  return res.status(200).json({
    status: "success",
    message: "Quiz published successfully",
    data: {
      quiz: addPublisherToQuiz(quiz, req.admin.name)
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