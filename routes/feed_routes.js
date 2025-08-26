const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed.js');
const feedMiddleware = require('../middleware/feed_middleware.js');

router.route('/')
    .get(feedMiddleware.deletePostsGreaterThan14Days ,feedController.getFeed);

module.exports = router;