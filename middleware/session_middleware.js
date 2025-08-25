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


module.exports = {
    sessionFound
}