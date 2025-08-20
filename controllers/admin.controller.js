const sequelize = require('../config/database');
const Admin = require('../models/admin.model.js');
const bcrypt = require('bcrypt');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const asyncWrapper = require('../middleware/async.wrapper');

const TARegister = asyncWrapper(async (req, res) => {
    const { email, name, password, phoneNumber, group} = req.body;
    const encryptedPassword = await bcrypt.hash(String(password), 10);
    await Admin.create({
        email,
        name,
        password,
        phoneNumber,
        group,
        role: "assistant",
        permission:"limited",
    });
    return res.status(201).json({
        status: "success" ,
        data: { message: "Assistant created successfully" }
    });
});

module.exports = {
    TARegister
}