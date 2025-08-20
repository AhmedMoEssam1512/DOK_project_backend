const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const Assignment = sequelize.define('Assignment', {
  asslId: { type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true  },
  publisher: DataTypes.STRING,
  mark: DataTypes.INTEGER,
  document: DataTypes.STRING,
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  semester: DataTypes.STRING
}, { tableName: 'assignment', timestamps: false });

module.exports = Assignment;
