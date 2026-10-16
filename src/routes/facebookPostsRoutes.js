const express = require("express");
const {
    scrapeFacebookPostsController,
    scrapeFacebookPostByUrlController,
} = require("../controllers/facebookPostsController");

const router = express.Router();

router.post("/", scrapeFacebookPostsController);
router.post("/url", scrapeFacebookPostByUrlController);

module.exports = router;
