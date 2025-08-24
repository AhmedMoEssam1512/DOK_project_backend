const sequelize = require('../config/database');
const Admin = require('../models/admin.model');
const Student = require('../models/student.model');
const asyncWrapper = require('../middleware/async.wrapper');
const Regection = require('../models/rejection.model');
const Registration = require('../models/registration.model');

function create(email,name,password,phoneNumber,group){
    return Admin.create({
        email,
        name,
        password,
        phoneNumber,
        group,
        role: "assistant",
        permission:"limited",
    });
}

function findAdminByEmail(email){
    return Admin.findOne({where : { email } })
}

function findByEmailAndId(studentEmail,id){
    return Regection.findOne({where: { studentEmail, adminId: String(id) } })
}


function Destroy (email){
    return Regection.destroy({
        where: { studentEmail: email   }
    })
}

function registrationDestroy (email){
    return Registration.destroy({
        where: { studentEmail: email   }
    })
}


function showPendingAdminRegistration(){
    return Admin.findAll({
        where: { verified : false }
    });
}

function createRegection(studentEmail,adminId,studentSemester){
    Regection.create({
        studentEmail: studentEmail,
        adminId : adminId,
        semester: studentSemester,
        dateAndTime: new Date(),
    });
}


function findRegistration(studentEmail){
    return Registration.findOne({
        where: { studentEmail: studentEmail }
    });
}

function verifyAssistant(email){
    return Admin.update({ verified: true }, { where: { email } });
}

function removeAssistant(email){
    return Admin.destroy({
        where: {email}
    });
}

function checkAssistantGroup(group){
    return Admin.findAll({
        where: { group, role: 'assistant' }
    });
}


function findNotVerifiedStudentsByTaGroup(TAGroup){
    return Student.findAll({
        where: {verified : false , group: TAGroup}});
}

function Count(group){
    return Admin.count({
        where: { group: group }
    });
}


module.exports={
    create,
    findNotVerifiedStudentsByTaGroup,
    Count,
    findAdminByEmail,
    findByEmailAndId,
    Destroy,
    registrationDestroy,
    createRegection,
    findRegistration,
    verifyAssistant,
    showPendingAdminRegistration,
    removeAssistant,
    checkAssistantGroup,
}