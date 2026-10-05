const express = require("express");
const checkTheRhymeController = require("../controllers/checkTheRhymeController");

const router = express.Router();

router.get("/video/:videoId", checkTheRhymeController.checkTheRhymeByVideoIdController);

module.exports = router;