const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const Submission = sequelize.define('Submission', {
  subId: { type: DataTypes.STRING, primaryKey: true, autoIncrement : true },
  score: DataTypes.INTEGER,
  answers: DataTypes.STRING,
  subDate: {type: DataTypes.DATE , defaultValue: DataTypes.NOW},
  studentId: DataTypes.INTEGER,
  assistantId: DataTypes.INTEGER,
  type: DataTypes.ENUM('quiz','assignment'),
  semester: DataTypes.STRING,
  QuizId: DataTypes.STRING,
  assId: DataTypes.STRING
}, { tableName: 'submission', timestamps: false });

module.exports = Submission;
