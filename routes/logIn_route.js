// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { logIn } = require("../controllers/logIn");

router.post("/", logIn);

module.exports = router;