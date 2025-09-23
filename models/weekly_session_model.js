const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const WeeklySession = sequelize.define('WeeklySession', {
  weeklySessionId: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true  
  },
  weekNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  recordedSessionLink: DataTypes.STRING,
  deadline: DataTypes.DATE,
  isSubmissionOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  semester: DataTypes.STRING,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, { 
  tableName: 'weekly_session', 
  timestamps: true 
});

module.exports = WeeklySession;

