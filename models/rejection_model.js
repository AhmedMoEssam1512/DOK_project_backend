const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const Regection = sequelize.define('Regection', {
  studentEmail: { type: DataTypes.STRING },
  adminId: { type: DataTypes.STRING, allowNull: false },
  semester: DataTypes.STRING,
  dateAndTime: {type : DataTypes.DATE , defaultValue: DataTypes.NOW},
}, { tableName: 'regection', timestamps: false });

module.exports = Regection;