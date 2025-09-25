const Topic = require('../models/topic_model');
const Quiz = require('../models/quiz_model');
const Assignment = require('../models/assignment_model');
const  asyncWrapper  = require('../middleware/asyncwrapper');
const AppError = require('../utils/app.error');
// Using numeric HTTP status codes to avoid extra dependencies

// ==================== TOPIC CONTROLLERS ====================

// Create Topic
const addTopic = asyncWrapper(async (req, res, next) => {
    const { title } = req.body;
    const { semester } = req.query;
    const adminId = req.admin.id;

    if (!title) {
        return next(new AppError("Topic title is required", 400));
    }
    // semester is validated by middleware.validateSemester (from req.query)

    const maxOrder = await Topic.max('order', { where: { adminId, semester } }) || 0;
    const topic = await Topic.create({ title, adminId, semester, order: maxOrder + 1 });

    res.status(201).json({
        status: "success",
        message: "Topic created successfully",
        data: { topic }
    });
});

// Get All Topics
const getAllTopics = asyncWrapper(async (req, res, next) => {
    const { semester } = req.query;
    const adminId = req.admin.id;

    if (!semester) {
        return next(new AppError("Semester is required", 400));
    }
    if (!['June', 'November'].includes(semester)) {
        return next(new AppError("Semester must be either 'June' or 'November'", 400));
    }

    const topics = await Topic.findAll({ where: { adminId, semester, isActive: true }, order: [['order', 'ASC']] });
    res.status(200).json({ status: "success", data: { totalTopics: topics.length, topics } });
});

// Get Topic by ID
const getTopicById = asyncWrapper(async (req, res, next) => {
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
    // Fetch quizzes and assignments for this topic
    const [quizInstances, assignmentInstances] = await Promise.all([
        Quiz.findAll({
            where: { topicId, adminId, semester, isActive: true },
            // Ensure publisher never appears in responses if it exists in DB
            attributes: { exclude: ['publisher'] },
            order: [['createdAt', 'DESC']]
        }),
        Assignment.findAll({
            where: { topicId, adminId, semester, isActive: true },
            order: [['createdAt', 'DESC']]
        })
    ]);

    // Helper: format createdAt to Africa/Cairo local time in ISO-like string
    const toCairoISO = (date) => {
        if (!date) return date;
        try {
            const s = new Date(date).toLocaleString('sv-SE', { timeZone: 'Africa/Cairo' });
            return s.replace(' ', 'T'); // e.g., 2025-09-24T13:05:37
        } catch (_) {
            return date;
        }
    };

    // Normalize to a single materials list with type field
    const materials = [
        ...quizInstances.map(q => {
            const obj = q.toJSON ? q.toJSON() : q;
            return { type: 'quiz', ...obj, createdAt: toCairoISO(obj.createdAt) };
        }),
        ...assignmentInstances.map(a => {
            const obj = a.toJSON ? a.toJSON() : a;
            return { type: 'assignment', ...obj, createdAt: toCairoISO(obj.createdAt) };
        })
    ].sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime; // newest first
    });

    res.status(200).json({ status: "success", data: { topic, materials } });
});

// Update Topic
const updateTopic = asyncWrapper(async (req, res, next) => {
    const { topicId } = req.params;
    const { title } = req.body;
    const { semester } = req.query; // Read semester from query
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
    if (title) topic.title = title;
    await topic.save();

    res.status(200).json({ status: "success", message: "Topic updated successfully", data: { topic } });
});

// Delete Topic
const deleteTopic = asyncWrapper(async (req, res, next) => {
    const { topicId } = req.params;
    const { semester } = req.query;
    const adminId = req.admin.id;

    if (!semester) {
        return next(new AppError("Semester is required", 400));
    }
    if (!['June', 'November'].includes(semester)) {
        return next(new AppError("Semester must be either 'June' or 'November'", 400));
    }

    // Find the topic first to get its title
    const topic = await Topic.findOne({ where: { topicId, adminId, semester, isActive: true } });
    if (!topic) {
        return next(new AppError("Topic not found", 404));
    }

    const topicTitle = topic.title;
    await Topic.destroy({ where: { topicId, adminId, semester } });
    
    res.status(200).json({ 
        status: "success", 
        message: `${topicTitle} deleted successfully` 
    });
});

// Delete All Topics
const deleteAllTopics = asyncWrapper(async (req, res, next) => {
    const { semester } = req.query;
    const adminId = req.admin.id;

    if (!semester) {
        return next(new AppError("Semester is required", 400));
    }
    if (!['June', 'November'].includes(semester)) {
        return next(new AppError("Semester must be either 'June' or 'November'", 400));
    }

    // Get all topics first to count them
    const topics = await Topic.findAll({ where: { adminId, semester, isActive: true } });
    const topicsCount = topics.length;

    if (topicsCount === 0) {
        return next(new AppError("No topics found to delete", 404));
    }

    // Delete all topics
    await Topic.destroy({ where: { adminId, semester } });
    
    res.status(200).json({ 
        status: "success", 
        message: `${topicsCount} topics deleted successfully` 
    });
});


module.exports = {
    addTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    deleteTopic,
    deleteAllTopics
};