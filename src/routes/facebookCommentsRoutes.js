const express = require("express");
const { scrapeFacebookCommentsController } = require("../controllers/facebookCommentsController");

const router = express.Router();

router.post("/", scrapeFacebookCommentsController);

module.exports = router;
