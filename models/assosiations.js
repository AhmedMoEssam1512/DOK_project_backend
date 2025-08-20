module.exports = db => {
    const { Student, Admin, Quiz, Assignment, Submission, Session, Attendance, Registration, Feed } = db;

    console.log("Setting up associations...");
    // ---------------- Student----------------

    // Student - Admin
    Student.belongsTo(Admin, { foreignKey: 'adminId' }); // Assuming Student.adminId refers to Admin
    Admin.hasMany(Student, { foreignKey: 'adminId' });

    // Student - Submission
    Student.hasMany(Submission, { foreignKey: 'student' }); // Submission.student refers to Student.studentId
    Submission.belongsTo(Student, { foreignKey: 'student' });

    // Student - Attendance
    Student.hasMany(Attendance, { foreignKey: 'studentId' });
    Attendance.belongsTo(Student, { foreignKey: 'studentId' });

    // Student - Registrations
    Student.hasOne(Registration, { foreignKey: 'userId' }); // Registrations.userId refers to Student.studentId
    Registration.belongsTo(Student, { foreignKey: 'userId' });


    //--------------------Admin---------------------

    // Admin - Feed
    Admin.hasMany(Feed, { foreignKey: 'adminId' });
    Feed.belongsTo(Admin, { foreignKey: 'adminId' });

    // Admin - Registration
    Admin.hasMany(Registration, { foreignKey: 'adminId' }); 
    Registration.belongsTo(Admin, { foreignKey: 'adminId' });

    // Admin - Session     
    Admin.hasMany(Session, { foreignKey: 'adminId' }); 
    Session.belongsTo(Admin, { foreignKey: 'adminId' });

    // Admin - Quiz
    Admin.hasMany(Quiz, { foreignKey: 'adminId' }); 
    Quiz.belongsTo(Admin, { foreignKey: 'adminId' });

    // Admin - Assignment
    Admin.hasMany(Assignment, { foreignKey: 'adminId' }); 
    Assignment.belongsTo(Admin, { foreignKey: 'adminId' });

    // Admin - Submission
    Admin.hasMany(Submission, { foreignKey: 'adminId' }); 
    Submission.belongsTo(Admin, { foreignKey: 'adminId' });


    // ---------------- Quiz - Submission ----------------
    Quiz.hasMany(Submission, { foreignKey: 'QuizId' }); // Submission.QuizId refers to Quiz.quizId
    Submission.belongsTo(Quiz, { foreignKey: 'QuizId' });


    // ---------------- Assignment - Submission ----------------
    Assignment.hasMany(Submission, { foreignKey: 'asslId' }); // Submission.assId refers to Assignment.asslId
    Submission.belongsTo(Assignment, { foreignKey: 'assId' });


    // ---------------- Session - Attendance ----------------
    Session.hasMany(Attendance, { foreignKey: 'sessionId' });
    Attendance.belongsTo(Session, { foreignKey: 'sessionId' });

    
    console.log("✅ All associations have been set up successfully!");
};