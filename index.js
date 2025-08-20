require("dotenv").config();
const express = require("express");
const { sequelize } = require('./models');
const httpStatusCode = require('./utils/http.status');

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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
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
