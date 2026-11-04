const express = require("express");
const callLLMController = require("../controllers/callLLMController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();


// GET: Lấy tất cả battler
router.post("/analysis-bar", requireRole("U0"), callLLMController.analysisBarController);



module.exports = router;
