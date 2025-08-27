const sequelize = require('../config/database');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const asyncWrapper = require('../middleware/asyncwrapper');
const Quiz = require('../models/quiz_model.js');
const quiz = require('../data_link/quiz_data_link.js');
const admin = require('../data_link/admin_data_link.js');
const student = require('../data_link/student_data_link.js');
const Admin = require('../models/admin_model.js');
const Student = require('../models/student_model.js');

const createQuiz = asyncWrapper(async (req, res) => {
    const {mark,quizPdf,date,semester,durationInMin} = req.body;
    const publisher = req.admin.id;
    console.log("publisher id:", publisher)
    console.log("Creating quiz with data:", {mark,quizPdf,date,semester,durationInMin});
    const newQuiz = await quiz.createQuiz(mark,publisher,quizPdf,date,semester,durationInMin);
    return res.status(201).json({
        status: "success" ,
        data: { message: "Quiz created successfully", quizId: newQuiz.quizId }
    });
});

const getAllQuizzes = asyncWrapper(async (req, res) => {
    const group = req.user.group;
    const quizzes = group =='all'?
    await quiz.getAllQuizzes() :   
    await quiz.getAllQuizzesForGroup(group);
    return res.status(200).json({
        status: "success",
        results: quizzes.length,
        data: { quizzes }
    });
});

const getQuizById = asyncWrapper(async (req, res, next) => {
    const quizData = req.quizData;
    return res.status(200).json({
        status: "success",
        data: { quizData }
    });
});

module.exports = {
    createQuiz  ,
    getAllQuizzes,
    getQuizById
};