const express = require("express");
const serperImageController = require("../controllers/serperImageController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.post("/", requireRole("U0"), serperImageController.searchImages);

module.exports = router;