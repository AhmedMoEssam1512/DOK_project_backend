// controllers/authController.js
const AppError = require("../utils/app.error.js"); // adjust path
const httpStatus = require("../utils/http.status.js"); // adjust path
const asyncWrapper = require("../middleware/asyncwrapper.js");
const Feed = require('../models/feed_model.js');
const feed = require('../data_link/feed_data_link.js');

const getFeed = asyncWrapper(async (req, res, next) => {
  const feeds = await feed.getAllFeeds();
  if (!feeds || feeds.length === 0) {
    return next(AppError.create("Feed is empty", 404, httpStatus.NotFound));
  }
  res.status(200).json({
    status: "success",
    results: feeds.length,
    data: feeds,
  });
})

module.exports = {
  getFeed,
};