const { Op } = require("sequelize"); // import Op
const sequelize = require('../config/database');
const feed = require('../models/feed_model.js');

function getAllFeeds(){
    return feed.findAll({
        order: [['dateAndTime', 'DESC']]
    });
}

function getFeedByAssistantIdAndSemester(adminId, semester){
    return feed.findAll({
        where: { adminId, semester},
        order: [['dateAndTime', 'DESC']]
    });
}

function destroyOldFeeds(cutoffDate){
    return feed.destroy({
        where: {
            dateAndTime: {
                [Op.lte]: cutoffDate   // use Op directly
            }
        }
    });
}

module.exports = {
    getAllFeeds,
    destroyOldFeeds,
    getFeedByAssistantIdAndSemester
};