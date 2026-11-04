const express = require("express");
const {
    scrapeFacebookPostsController,
    scrapeFacebookPostByUrlController,
} = require("../controllers/facebookPostsController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.post("/", requireRole("U0"), scrapeFacebookPostsController);
router.post("/url", requireRole("U0"), scrapeFacebookPostByUrlController);

module.exports = router;
