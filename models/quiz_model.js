const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Quiz = sequelize.define('Quiz', {
  quizId: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true  
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Untitled Quiz'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON, // Array of attachments (Drive links or uploaded files)
    allowNull: true,
    defaultValue: []
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: true
  },
  maxPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  timeLimit: {
    type: DataTypes.INTEGER, // Time limit in minutes
    allowNull: true
  },
  topicId: {
    type: DataTypes.INTEGER,
    allowNull: true // Can be null for quizzes not in any topic
  },
  
  semester: {
    type: DataTypes.STRING,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true // Default to published
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Quiz-specific fields
  allowLateSubmissions: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isGraded: {
    type: DataTypes.BOOLEAN,
    defaultValue: true // Quizzes are usually graded
  },
  showResults: {
    type: DataTypes.BOOLEAN,
    defaultValue: true // Whether to show results immediately
  },
}, {
  tableName: 'quiz', 
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

module.exports = Quiz;