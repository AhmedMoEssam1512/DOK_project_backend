const sequelize = require('../config/database');
const Admin = require('../models/admin_model.js');
const httpStatus = require('../utils/http.status');
const AppError = require('../utils/app.error');
const asyncWrapper = require('./asyncwrapper.js');
const admin = require('../data_link/admin_data_link.js');
const Submission = require('../models/submission_model.js');

const subExist = asyncWrapper(async (req,res ,next) => {
    const subId = req.params.id;
    const found = await admin.findSubmissionById(subId)
    if (!found) {
        return next(new AppError("Submission demanded is not found", httpStatus.NOT_FOUND));
    }
    console.log("Submission found : ",found);
    req.found=found;
    next();
})

const canSeeSubmission = asyncWrapper(async (req,res, next) => {
    const sub = req.found;
    const adminId = req.admin.id;
    if(!adminId){
        return next(new AppError("Admin not found", httpStatus.NOT_FOUND))
    }
    console.log("AdminId: ",adminId);
    if(sub.assistantId !== adminId &&  adminId !== 1){
        return next(new AppError("You are not allowed to view this submission", httpStatus.FORBIDDEN));
    }
    next();
})

module.exports ={
    subExist,
    canSeeSubmission,
}