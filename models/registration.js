const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const Registration = sequelize.define('Registrations', {
  userId: { type: DataTypes.STRING, primaryKey: true },
  adminId: { type: DataTypes.STRING, primaryKey: true },
  semester: DataTypes.STRING,
  dateAndTime: DataTypes.DATE
}, { tableName: 'registrations', timestamps: false });

module.exports = Registration;
