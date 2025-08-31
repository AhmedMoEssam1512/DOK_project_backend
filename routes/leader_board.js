const express = require("express");
const router = express.Router();
const { leaderBoard } = require("../controllers/leader_board");

router.get("/", leaderBoard);

module.exports = router;