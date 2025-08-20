const sequelize = require('../config/database');
const Admin = require('../models/admin.model.js');
const bcrypt = require('bcrypt');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const asyncWrapper = require('../middleware/async.wrapper');
const jwt = require("jsonwebtoken");

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

const signIn = asyncWrapper(async (req, res, next) => {
  const admin = req.admin; // must be set earlier by findAndCheckAdmin
  const adminToken = jwt.sign(
    {
      id: admin.adminId,
      email: admin.email,
      role: admin.role,
      permission: admin.permission,
    },
    process.env.JWT_SECRET, // 👈 must match protect middleware
    { expiresIn: process.env.JWT_EXPIRATION } // fallback if not set
  );

  res.status(200).json({
    status: "success",
    message: "Login successful",
    token: adminToken, // standardized key name
  });
});

module.exports = {
    TARegister
    , signIn
}