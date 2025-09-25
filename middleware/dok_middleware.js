const sequelize = require('../config/database');
const Admin = require('../models/admin_model.js');
const bcrypt = require('bcrypt');
const AppError = require('../utils/app.error');
const asyncWrapper = require('./asyncwrapper');
const admin = require('../data_link/admin_data_link');


const findAdmin = asyncWrapper(async (req, res, next) => {
  const { email } = req.params;
  const assistant = await admin.findAdminByEmail(email);
  if (!assistant) {
    return next(new AppError('Admin not found', 404));
  }
  req.assistant = assistant;
  console.log("admin found") // attach found admin for later use
  next();
});



const checkRole = asyncWrapper(async (req, res, next) => {
  // Allow admins with specific roles or IDs
  if (req.admin.role === 'teacher' || req.admin.id === 1) {
    next();
  } else {
    return next(new AppError('You are not authorized to perform this action', 403));
  }
});

const DOKFound= asyncWrapper(async (req, res, next) => {
  const dok = await Admin.findOne({ where: { adminId: 1 } });
  if(dok){
    return next(new AppError('DOK already exists', 400));
  }
  console.log("DOK not found, proceed to create one");
  next();
});
module.exports = {
    findAdmin,
    checkRole,
    DOKFound
};