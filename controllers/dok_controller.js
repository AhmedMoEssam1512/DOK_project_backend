const sequelize = require('../config/database');
const Admin = require('../models/admin_model.js');
const Student = require('../models/student_model.js');
const Quiz = require('../models/quiz_model.js');
const Assignment = require('../models/assignment_model.js');
const Submission = require('../models/submission_model.js');
const Session = require('../models/session_model.js');
const Attendance = require('../models/attendance_model.js');
const Feed = require('../models/feed_model.js');
const Registration = require('../models/registration_model.js');
const Topic = require('../models/topic_model.js');
const admins = require('../data_link/admin_data_link');
const bcrypt = require('bcrypt');
const AppError = require('../utils/app.error');
const  asyncWrapper  = require('../middleware/asyncwrapper');



const DOK_signUp= asyncWrapper( async (req, res) => {
    const { email, name, password, phonenumber, role = "teacher", permission = "all" } = req.body;

    // hash password
    const encryptedPassword = await bcrypt.hash(String(password), 10);

    // create admin
    await Admin.create({
      adminId:1,
      email,
      name,
      password: encryptedPassword,
      phoneNumber: phonenumber,
      group: "all", 
      role,
      permission,
      verified: true,
    });
    return res.status(201).json({
      status: "success" ,
      data: { message: "Teacher created successfully" }
    });
})

const rejectAssistant = asyncWrapper(async (req, res) => {
    const { email } = req.params;
    const assistant = await admins.findAdminByEmail(email);
    await admins.removeAssistant( email  );
    return res.status(200).json({
    status: "success",
    message: `Assistant with email ${email} rejected and removed from database`
  });
});

const acceptAssistant = asyncWrapper(async (req, res) => {
    const { email } = req.params;
    const assistant = await admins.findAdminByEmail( email );
    await admins.verifyAssistant( email );
    return res.status(200).json({
        status: "success",
        message: `Assistant with email ${email} accepted`
    });
})

const showPendingRegistration = asyncWrapper(async (req, res) => {
    const admin = await admins.showPendingAdminRegistration();
    return res.status(200).json({
        status: "success",
        message: `Pending registration from assistants`,
        data: { 
  data: admin.map(admin => ({
      name: admin.name,
      email: admin.email,
      group: admin.group
    }))
}})})

const removeAssistant = asyncWrapper(async (req, res) => {
    const { email } = req.params;
    const deleted = await admins.removeAssistant(email);
    return res.status(200).json({
        status: "success",
        message: `Assistant with email ${email} removed successfully`
    })
})

const checkAssistantGroup = asyncWrapper(async (req, res) => {
    const { group } = req.params;
    const admin = await admins.checkAssistantGroup( group );
    return res.status(200).json({
        status: "success",
        data: {
            data: admin.map(admin => ({
                name: admin.name,
                email: admin.email
            }))
        }
    });
});

const assignGroupToAssistant = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    const { group } = req.body;
    const assistant = await admins.findAdminById(id);
    if (!assistant) {
        return next(new AppError('Assistant not found', 404));
    }
    assistant.group = group;
    await assistant.save();
    return res.status(200).json({
        status: "success",
        message: `Group ${group} assigned to assistant ${assistant.name} successfully`
    });
});

const clearDatabase = asyncWrapper(async (req, res) => {
    const semester = req.body.semester;
    if (!semester || !['June', 'November'].includes(semester)) {
        return res.status(400).json({
            status: "error",
            message: "Semester must be either 'June' or 'November'"
        });
    }
    await Student.destroy({ where: {semester} });
    await Quiz.destroy({ where: {semester} });
    await Assignment.destroy({ where: {semester} });
    await Submission.destroy({ where: {semester} });
    await Session.destroy({ where: {semester} });
    await Attendance.destroy({ where: {semester} });
    await Feed.destroy({ where: {semester} });
    await Registration.destroy({ where: {semester} });
    await Topic.destroy({ where: {semester} });
    return res.status(200).json({
        status: "success",
        message: `Database cleared for semester ${semester}`
    });

});

module.exports = {
    DOK_signUp, 
    rejectAssistant,
    acceptAssistant,
    showPendingRegistration,
    removeAssistant,
    checkAssistantGroup,
    clearDatabase,
    assignGroupToAssistant
}