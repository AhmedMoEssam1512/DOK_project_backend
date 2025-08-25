const sequelize = require('../config/database');
const Session = require('../models/session_model');
const {where} = require("sequelize");
const {verify} = require("jsonwebtoken");

function findSessionById(sessionId){
    return Session.findOne({where : { sessionId } });
}

module.exports={
    findSessionById
}