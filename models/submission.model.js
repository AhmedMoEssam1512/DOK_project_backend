const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const Submission = sequelize.define('Submission', {
  subId: { type: DataTypes.STRING, primaryKey: true },
  score: DataTypes.INTEGER,
  document: DataTypes.STRING,
  subDate: {type: DataTypes.DATE , defaultValue: DataTypes.NOW},
  student: DataTypes.STRING,
  assistant: DataTypes.STRING,
  type: DataTypes.ENUM('quiz','assignment'),
  semester: DataTypes.STRING,
  QuizId: DataTypes.STRING,
  assId: DataTypes.STRING
}, { tableName: 'submission', timestamps: false });

module.exports = Submission;
