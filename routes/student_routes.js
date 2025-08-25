const express = require('express');
const router = express.Router();
const studentControllers = require('../controllers/student_controller');
const studentMiddleWare = require('../middleware/student_middleware');
const adminMiddleWare = require('../middleware/admin_middleware');
const auth = require('../middleware/auth_middleware');
const { establishStudentConnection } = require('../controllers/SSE_connection');

router.route('/studentRegister')
    .post(studentMiddleWare.studentFound,adminMiddleWare.passwordEncryption,studentControllers.studentRegister);

router.route('/studentSSEConnection')
    .get(auth.studentProtect, establishStudentConnection);

module.exports = router;