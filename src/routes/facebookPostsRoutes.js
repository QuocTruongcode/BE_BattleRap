const express = require("express");
const { scrapeFacebookPostsController } = require("../controllers/facebookPostsController");

const router = express.Router();

router.post("/", scrapeFacebookPostsController);

module.exports = router;
