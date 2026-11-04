const express = require("express");
const createReviewController = require("../controllers/createReviewController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();



// GET: Lấy tất cả video
router.get("/", requireRole("U0"), createReviewController.getComments);

router.post('/:jobId/cancel', requireRole("U0"), createReviewController.cancelComments);

module.exports = router;
