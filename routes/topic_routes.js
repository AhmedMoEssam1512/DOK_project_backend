const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth_middleware');
const topicControllers = require('../controllers/topic_controller');
const topicMiddleware = require('../middleware/topic_middleware');

// ==================== TOPIC ROUTES ====================

// ==================== TOPIC ROUTES (nested under library) ====================

// Get all topics and add a new topic to the library
router.route('/topics')
    .get(auth.adminProtect, topicMiddleware.validateSemester, topicControllers.getAllTopics)
    .post(auth.adminProtect, topicMiddleware.validateSemester, topicControllers.addTopic);

// Topic by ID routes
router.route('/topics/:topicId')
    .get(auth.adminProtect, topicMiddleware.validateSemester, topicMiddleware.topicExists, topicControllers.getTopicById)
    .patch(auth.adminProtect, topicMiddleware.validateSemester, topicMiddleware.topicExists, topicControllers.updateTopic)
    .delete(auth.adminProtect, topicMiddleware.validateSemester, topicMiddleware.topicExists, topicControllers.deleteTopic);

// Delete all topics route
router.delete('/topics', auth.adminProtect, topicMiddleware.validateSemester, topicControllers.deleteAllTopics);

module.exports = router;
