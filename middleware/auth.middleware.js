const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const asyncWrapper = require('../middleware/async.wrapper');


const protect = async (req, res, next) => {
  let token;

  // Check for "Authorization: Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, no token', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // 👈 same secret
    req.user = decoded; // { id: ... }
    next();
  } catch (error) {
    return next(new AppError('Not authorized, token failed', 401));
  }
};

module.exports = { protect };

