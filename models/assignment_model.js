const sequelize = require('../config/database');
const { Sequelize, DataTypes } = require('sequelize');
const Assignment = sequelize.define('Assignment', {
  assignId: { type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true  },
  publisher: DataTypes.INTEGER,
  mark: DataTypes.INTEGER,
  document: DataTypes.STRING,
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  semester: DataTypes.STRING
}, { tableName: 'assignment', timestamps: false });

module.exports = Assignment;
