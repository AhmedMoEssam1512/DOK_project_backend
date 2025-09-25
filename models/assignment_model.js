const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Assignment = sequelize.define('Assignment', {
  assignmentId: { 
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
    defaultValue: 'Untitled Assignment'
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
  topicId: {
    type: DataTypes.INTEGER,
    allowNull: true // Can be null for assignments not in any topic
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
    defaultValue: true // Default to published automatically
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Assignment-specific fields
  allowLateSubmissions: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isGraded: {
    type: DataTypes.BOOLEAN,
    defaultValue: true // Assignments are usually graded
  },
}, {
  tableName: 'assignment',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
});

module.exports = Assignment;