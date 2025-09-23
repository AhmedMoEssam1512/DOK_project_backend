const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Topic = sequelize.define('Topic', {
  topicId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  semester: {
    type: DataTypes.ENUM('June', 'November'),
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'topic',
  timestamps: true,
  createdAt: false,
  updatedAt: false
});

module.exports = Topic;