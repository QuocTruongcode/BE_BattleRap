'use strict';

const express = require("express");
const keysDeCodeVideoController = require("../controllers/keysDeCodeVideoController");

const router = express.Router();

router.get("/:videoId", keysDeCodeVideoController.getVideoKeyController);

module.exports = router;