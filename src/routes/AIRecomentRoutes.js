const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const AIRecomentController = require("../controllers/AIRecomentController");

const router = express.Router();

router.get("/history", requireAuth, AIRecomentController.getUserActivityHistory);
router.get("/history/latest", requireAuth, AIRecomentController.getLatestUserActivities);
router.get("/history/recommendation-markdown", requireAuth, AIRecomentController.getLatestUserActivitiesMarkdown);

module.exports = router;
