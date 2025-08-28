const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const Submission = sequelize.define('Submission', {
  subId: {  type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true },
  score: DataTypes.INTEGER,
  answers: DataTypes.STRING,
  marked:  DataTypes.STRING,
  subDate: {type: DataTypes.DATE , defaultValue: DataTypes.NOW},
  studentId: DataTypes.INTEGER,
  assistantId: DataTypes.INTEGER,
  type: DataTypes.ENUM('quiz','assignment'),
  semester: DataTypes.STRING,
  quizId: DataTypes.INTEGER,
<<<<<<< HEAD
  assignId: DataTypes.INTEGER
=======
  assId: DataTypes.INTEGER,
>>>>>>> 3d6870d8c35a0ac6f4a155b5ad0b3caf6d59e1f1
}, { tableName: 'submission', timestamps: false });

module.exports = Submission;
