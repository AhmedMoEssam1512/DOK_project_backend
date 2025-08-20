const sequelize = require('../config/database');
const Admin = require('../models/admin.model.js');
const bcrypt = require('bcrypt');
const AppError = require('../utils/app.error');
const asyncWrapper = require('../middleware/async.wrapper');

const DOK_signUp= asyncWrapper( async (req, res) => {
    const { email, name, password, phonenumber, role = "teacher", permission = "all" } = req.body;

    // hash password
    const encryptedPassword = await bcrypt.hash(String(password), 10);

    // create admin
    await Admin.create({
      adminId: 1,
      email,
      name,
      password: encryptedPassword,
      phoneNumber: phonenumber,
      group: "all", // matches model field
      role,
      permission,
      verified: true,
    });

    return res.status(201).json({
      status: "success" ,
      data: { message: "Teacher created successfully" }
    });
})

module.exports = {
    DOK_signUp
}