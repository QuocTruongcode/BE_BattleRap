const express = require("express");
const reviewDramaController = require("../controllers/reviewDramaController");

const router = express.Router();

router.get("/:dramaID", reviewDramaController.getReviewDramaController);

module.exports = router;
