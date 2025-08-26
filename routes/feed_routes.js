const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed.js');
const feedMiddleware = require('../middleware/feed_middleware.js');
const auth = require('../middleware/auth_middleware');

router.route('/')
    .get(auth.adminProtect ,feedMiddleware.deletePostsGreaterThan14Days ,feedController.getFeed);

module.exports = router;