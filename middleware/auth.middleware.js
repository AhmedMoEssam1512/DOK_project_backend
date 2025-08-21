const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const asyncWrapper = require('../middleware/async.wrapper');


const adminProtect = async (req, res, next) => {
  let token;

  // 1. Support for "Authorization: Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Support for ?token=abc in query (for EventSource)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return next(new AppError('Not authorized, no token', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // attach payload
    next();
  } catch (error) {
    return next(new AppError('Not authorized, token failed', 401));
  }
};

const studentProtect = async (req, res, next) => {
  let token;

  // 1. Support for "Authorization: Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Support for ?token=abc in query (for EventSource)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return next(new AppError('Not authorized, no token', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.student = decoded; // attach payload
    next();
  } catch (error) {
    return next(new AppError('Not authorized, token failed', 401));
  }
};


module.exports = { 
  adminProtect,
  studentProtect
 };

