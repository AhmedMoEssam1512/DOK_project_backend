const  asyncWrapper  = require('./asyncwrapper');
const AppError = require('../utils/app.error');
// Using numeric HTTP status codes
const Topic = require('../models/topic_model');

// ==================== TOPIC MIDDLEWARE ====================

// Check if topic exists
const topicExists = asyncWrapper(async (req, res, next) => {
    const { topicId } = req.params;
    const { semester } = req.query;
    const adminId = req.admin.id;

    if (!semester) {
        return next(new AppError("Semester is required", 400));
    }

    if (!['June', 'November'].includes(semester)) {
        return next(new AppError("Semester must be either 'June' or 'November'", 400));
    }

    const topic = await Topic.findOne({ where: { topicId, adminId, semester, isActive: true } });

    if (!topic) {
        return next(new AppError("Topic not found", 404));
    }

    req.topic = topic;
    next();
});

// Validate semester parameter
const validateSemester = asyncWrapper(async (req, res, next) => {
    const { semester } = req.body;

    if (!semester) {
        return next(new AppError("Semester is required", 400));
    }

    if (!['June', 'November'].includes(semester)) {
        return next(new AppError("Semester must be either 'June' or 'November'", 400));
    }

    next();
});

// Check if any topic exists for semester (optional helper)
const anyTopicForSemester = asyncWrapper(async (req, res, next) => {
    const { semester } = req.query;
    const adminId = req.admin.id;
    const anyTopic = await Topic.findOne({ where: { adminId, semester, isActive: true } });
    req.hasTopics = !!anyTopic;
    next();
});

module.exports = {
    topicExists,
    validateSemester,
    anyTopicForSemester
};