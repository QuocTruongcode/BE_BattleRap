const express = require("express");
const serperImageController = require("../controllers/serperImageController");

const router = express.Router();

router.post("/", serperImageController.searchImages);

module.exports = router;