const express = require("express");
const callLLMController = require("../controllers/callLLMController");

const router = express.Router();


// GET: Lấy tất cả battler
router.post("/analysis-bar", callLLMController.analysisBarController);



module.exports = router;
