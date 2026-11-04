const express = require("express");
const { scrapeFacebookCommentsController } = require("../controllers/facebookCommentsController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.post("/", requireRole("U0"), scrapeFacebookCommentsController);

module.exports = router;
