const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/app.error');
const httpStatus = require('../utils/http.status');
const Token = require('../models/token.model');
const asyncWrapper = require('../middleware/async.wrapper');
const TokenBlacklist = require('../models/tokenBlacklist.model');

const checkRefreshToken = asyncWrapper(async (req,res,next) => {
    const token = req.cookies.refreshToken;
    if(!token){
        const error = appError.create("Refresh Token not found", 404, httpStatus.Error);
        return next(error);
    }
    if(!Token.findOne({token})){
        const error = appError.create("Invalid refresh token", 404, httpStatus.Error);
        return next(error);
    }
    next();
});

const protect = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    
    try {
        const blacklisted = await TokenBlacklist.findOne({ token });
        if (blacklisted) {
            return res.status(401).json({ message: 'User is signed Out' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        req.user = decoded;  
        next();
    } catch (error) {
        return next(new AppError('Not authorized, token failed', 401, httpStatus.Error));
    }
};

module.exports = {
    protect,
    checkRefreshToken
}
