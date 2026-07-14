const express = require("express");
const youtubeController = require("../controllers/youtubeController");

const router = express.Router();



// GET: Lấy tất cả video
router.get("/", youtubeController.getComments);


module.exports = router;
