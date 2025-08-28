const sequelize = require('../config/database');
const Session = require('../models/session_model');
const {where} = require("sequelize");
const {verify} = require("jsonwebtoken");

function findSessionById(sessionId){
    return Session.findOne({where : { sessionId } });
}

function UpdateSession(sessionId, dateAndTime){
    return Session.update({dateAndTime},{where : { sessionId } })};

module.exports={
    findSessionById,
    UpdateSession
}