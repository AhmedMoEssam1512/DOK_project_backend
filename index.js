require("dotenv").config();
const sequelize = require('./config/database'); 
const express = require("express");
const httpStatusCode = require('./utils/http.status');
const adminRoutes = require('./routes/admin.routes');
const dokRoutes = require('./routes/dok.routes');
const studentRoutes = require('./routes/student.routes');
const app = express();
app.use(express.json());

// Test DB connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection has been established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
})();
const PORT = process.env.PORT 
// Start server
sequelize.sync({ alter: true })  
  .then(() => {
    console.log('✅ Database syncing');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Failed to sync DB:', err);
  });

app.use('/admin', adminRoutes);
app.use('/dok', dokRoutes);
app.use('/student', studentRoutes);
/*
// Global not-found handler
app.use('*', (req, res) => {
    res.status(404).json({
        status: httpStatusCode.Error,
        data: { message: "This resource is not found" }
    });
});
*/

// Global error handler
app.use((error, req, res, next) => {
    if(error.name === "ValidationError"){
        error.statusMessage = httpStatusCode.Error;
        error.statusCode = 400;
        error.message = "Invalid email format";
    }
    res.status(error.statusCode || 400).json({
        status: error.statusMessage,
        data: { message: error.message }
    });
});
