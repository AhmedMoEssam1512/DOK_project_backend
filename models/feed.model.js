const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const Feed = sequelize.define('Feed', {
  feedId:{ type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true  },
  text: DataTypes.STRING,
  dateAndTime: DataTypes.DATE,
  semester: DataTypes.STRING,
  adminId: DataTypes.STRING
}, { tableName: 'feed', timestamps: false });

module.exports = Feed;
