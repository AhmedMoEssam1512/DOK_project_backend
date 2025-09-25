module.exports = db => {
    const { Student, Admin, Quiz, Assignment, Submission, Session, Attendance, Registrations, Feed, Topic, WeeklySession } = db;

    console.log("Setting up associations...");
    // ---------------- Student----------------

    // Student - Admin
    Student.belongsTo(Admin, { foreignKey: 'adminId' }); // Assuming Student.adminId refers to Admin
    Admin.hasMany(Student, { foreignKey: 'adminId' });

    // Student - Submission
    Student.hasMany(Submission, { foreignKey: 'studentId' }); 
    Submission.belongsTo(Student, { foreignKey: 'studentId' });

    // Student - Attendance
    Student.hasMany(Attendance, { foreignKey: 'studentId' });
    Attendance.belongsTo(Student, { foreignKey: 'studentId' });

    // Student - Registrations
    Student.hasOne(Registrations, { foreignKey: 'userId' }); // Registrations.userId refers to Student.studentId
    Registrations.belongsTo(Student, { foreignKey: 'userId' });


    //--------------------Admin---------------------

    // Admin - Feed
    Admin.hasMany(Feed, { foreignKey: 'adminId' });
    Feed.belongsTo(Admin, { foreignKey: 'adminId' });

    // Admin - Registration
    Admin.hasMany(Registrations, { foreignKey: 'adminId' }); 
    Registrations.belongsTo(Admin, { foreignKey: 'adminId' });

    // Admin - Session     
    Admin.hasMany(Session, { foreignKey: 'adminId' }); 
    Session.belongsTo(Admin, { foreignKey: 'adminId' });

    // Admin - Quiz
    Admin.hasMany(Quiz, { foreignKey: 'adminId' }); 
    Quiz.belongsTo(Admin, { foreignKey: 'adminId' });

    // Admin - Assignment
    Admin.hasMany(Assignment, { foreignKey: 'adminId' }); 
    Assignment.belongsTo(Admin, { foreignKey: 'adminId' });

    // Admin - Submission (for grading)
    Admin.hasMany(Submission, { foreignKey: 'gradedBy' }); 
    Submission.belongsTo(Admin, { foreignKey: 'gradedBy', as: 'Grader' });

    // Admin - Topic
    Admin.hasMany(Topic, { foreignKey: 'adminId' });
    Topic.belongsTo(Admin, { foreignKey: 'adminId' });

    // Admin - WeeklySession
    Admin.hasMany(WeeklySession, { foreignKey: 'adminId' }); 
    WeeklySession.belongsTo(Admin, { foreignKey: 'adminId' });

    // Note: Topics are standalone rows keyed by adminId + semester

    // ---------------- Quiz - Submission ----------------
    Quiz.hasMany(Submission, { foreignKey: 'quizId' }); 
    Submission.belongsTo(Quiz, { foreignKey: 'quizId' });

    // ---------------- Assignment - Submission ----------------
    Assignment.hasMany(Submission, { foreignKey: 'assId' }); 
    Submission.belongsTo(Assignment, { foreignKey: 'assId' });

    // ---------------- Assignment - Topic ----------------
    Assignment.belongsTo(Topic, { foreignKey: 'topicId', as: 'Topic' });
    Topic.hasMany(Assignment, { foreignKey: 'topicId', as: 'Assignments' });

    // ---------------- Quiz - Topic ----------------
    Quiz.belongsTo(Topic, { foreignKey: 'topicId', as: 'Topic' });
    Topic.hasMany(Quiz, { foreignKey: 'topicId', as: 'Quizzes' });


    // ---------------- Session - Attendance ----------------
    Session.hasMany(Attendance, { foreignKey: 'sessionId' });
    Attendance.belongsTo(Session, { foreignKey: 'sessionId' });

    
    console.log("✅ All associations have been set up successfully!");
};