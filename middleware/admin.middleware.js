const sequelize = require('../config/database');
const Admin = require('../models/admin.model.js');
const bcrypt = require('bcrypt');
const httpStatus = require('../utils/http.status');
const AppError = require('../utils/app.error');
const asyncWrapper = require('../middleware/async.wrapper');

const adminFound= asyncWrapper(async (req, res, next) => {
    const { email } = req.body;
    const found = await Admin.findOne({ where: { email } });
    if (found) {
        const error = AppError.create("Email already exists", 400, httpStatus.Error);
        return next(error);
    }
    next();
})

const passwordEncryption = asyncWrapper( async (req,res,next) => {
    const { password } = req.body;
    const encryptedPassword = await bcrypt.hash(String(password),10);
    req.body.password = encryptedPassword;
    next();
});

module.exports = {
    adminFound,
    passwordEncryption,
}