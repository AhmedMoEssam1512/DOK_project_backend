const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Submission = sequelize.define('Submission', {
  submissionId: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true  
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Reference to either Quiz or Assignment
  quizId: {
    type: DataTypes.INTEGER,
    allowNull: true // Will be null if this is an assignment submission
  },
  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: true // Will be null if this is a quiz submission
  },
  // Submission content
  answers: {
    type: DataTypes.TEXT, // JSON string of answers (for quiz) or submission content (for assignment)
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON, // Array of submitted files
    allowNull: true,
    defaultValue: []
  },
  // Submission status and grading
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'graded', 'returned', 'late'),
    defaultValue: 'draft'
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true // Points earned
  },
  maxScore: {
    type: DataTypes.INTEGER,
    allowNull: true // Maximum possible points
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2), // Percentage score (e.g., 85.50)
    allowNull: true
  },
  grade: {
    type: DataTypes.STRING, // Letter grade (A, B, C, D, F)
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT, // Teacher feedback
    allowNull: true
  },
  // Timing information
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  gradedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isLate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  latePenalty: {
    type: DataTypes.DECIMAL(5, 2), // Late penalty percentage
    allowNull: true,
    defaultValue: 0
  },
  // Attempt tracking (for quizzes)
  attemptNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  },
  timeSpent: {
    type: DataTypes.INTEGER, // Time spent in minutes
    allowNull: true
  },
  // Additional metadata
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  gradedBy: {
    type: DataTypes.INTEGER,
    allowNull: true // Admin who graded this submission
  },
  // Flags
  isPlagiarized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  plagiarismScore: {
    type: DataTypes.DECIMAL(5, 2), // Plagiarism percentage
    allowNull: true
  },
  isAutoGraded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Peer review (for assignments)
  peerReviewScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  peerReviewCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  }
}, {
  tableName: 'submission',
  timestamps: true,
  createdAt: false,
  updatedAt: false
});

module.exports = Submission;