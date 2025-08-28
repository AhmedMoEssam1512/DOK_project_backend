const sequelize = require('../config/database');
const bcrypt = require('bcrypt');
const httpStatus = require('../utils/http.status');
const AppError = require('../utils/app.error');
const asyncWrapper = require('./asyncwrapper');
const {where} = require("sequelize");
const session = require('../data_link/session_data_link.js');

const sessionFound = asyncWrapper(async (req, res, next) => {
    const { sessionId } = req.params;
    const sessFound = await session.findSessionById(sessionId);
    if (!sessFound) {
        const error = AppError.create("Session not found", 404, httpStatus.Error);
        return next(error);
    }
    next();
})

const sessionStarted = asyncWrapper(async (req, res, next) => {
    const { sessionId } = req.params;
    const sessFound = await session.findSessionById(sessionId);

    if (!sessFound || !sessFound.dateAndTime) {
        const error = AppError.create("Session not started yet", 400, httpStatus.Error);
        return next(error);
    }

    const sessionStart = new Date(sessFound.dateAndTime); 
    const now = new Date();

    const sessionEnd = new Date(sessionStart.getTime() + 150 * 60 * 1000);

    const sameDate =
        now.getFullYear() === sessionStart.getFullYear() &&
        now.getMonth() === sessionStart.getMonth() &&
        now.getDate() === sessionStart.getDate();

    if (!sameDate) {
        const error = AppError.create("Session is not scheduled for today", 400, httpStatus.Error);
        return next(error);
    }

    // check if current time is within allowed range
    if (now < sessionStart || now > sessionEnd) {
        const error = AppError.create("Attendance window closed", 400, httpStatus.Error);
        return next(error);
    }

    next();
});



module.exports = {
    sessionFound,
    sessionStarted
}