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
const { getCache } = require("../utils/cache");
const { setCache } = require("../utils/cache");
const { Op } = require("sequelize");

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

    // Get all quizzes based on group
    const quizzes = group === 'all'
        ? await quiz.getAllQuizzes()
        : await quiz.getAllQuizzesForGroup(group);

    // Filter only quizzes that have already passed
    const now = new Date();
    const passedQuizzes = quizzes.filter(q => new Date(q.date) < now);

    return res.status(200).json({
        status: "success",
        results: passedQuizzes.length,
        data: { quizzes: passedQuizzes }
    })
});

const getQuizById = asyncWrapper(async (req, res, next) => {
    const quizData = req.quizData;
    return res.status(200).json({
        status: "success",
        data: { quizData }
    });
});

const startQuiz = asyncWrapper(async (req, res, next) => {
    const { quizId } = req.params;

    // update quiz date to now
    const updated = await quiz.updateQuizDate(quizId, new Date());
    console.log("Update result:", updated);  // 👈 check how many rows got updated

    const quizData = await quiz.getQuizById(quizId);
    console.log("Fetched after update:", quizData); // 👈 confirm new date is stored

    // cache it
    setCache("activeQuiz", quizData, 4000);

    return res.status(200).json({
        status: "success",
        data: { message: "Quiz started and cached", quiz: quizData }
    });
});



const getActiveQuiz = asyncWrapper(async (req, res, next) => {
    const activeQuiz = req.activeQuiz;
    return res.status(200).json({
        status: "success",
        data: { activeQuiz }
    });
});


module.exports = {
    createQuiz  ,
    getAllQuizzes,
    getQuizById, 
    startQuiz,
    getActiveQuiz
};