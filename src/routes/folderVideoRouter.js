
'use strict';

const express = require("express");
const folderVideoController = require("../controllers/folderVideoController");

const router = express.Router();

router.get("/", folderVideoController.getFolderVideoNamesController);

module.exports = router;
