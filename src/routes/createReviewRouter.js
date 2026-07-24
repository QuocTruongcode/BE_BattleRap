const express = require("express");
const createReviewController = require("../controllers/createReviewController");

const router = express.Router();



// GET: Lấy tất cả video
router.get("/", createReviewController.getComments);

router.post('/:jobId/cancel', createReviewController.cancelComments);

module.exports = router;
