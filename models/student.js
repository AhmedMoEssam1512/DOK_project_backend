const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  studentId: { type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true  },
  studentEmail:{ type:DataTypes.STRING , unique: true, allowNull: false, validate: { isEmail: true }},
  studentName: DataTypes.STRING,
  password: DataTypes.STRING,
  assistantId: DataTypes.STRING,
  group: DataTypes.STRING,
  semester: DataTypes.STRING,
  parentPhoneNumber: DataTypes.STRING,
  studentPhoneNumber: DataTypes.STRING,
  totalScore: DataTypes.INTEGER,
  createdAt: DataTypes.DATE,
  verified: DataTypes.BOOLEAN,
  banned: DataTypes.BOOLEAN
}, {
  tableName: 'student',
  timestamps: false
});

module.exports = Student;
