// config/database.js  (runtime)
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 5432),
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: false,
    }
);

module.exports = sequelize;
