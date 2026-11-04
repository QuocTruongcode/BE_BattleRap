const express = require("express");
const tavilyController = require("../controllers/tavilyController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();


// GET: Lấy tất cả battler
router.post("/", requireRole("U0"), tavilyController.searchInternetContextController);



module.exports = router;
