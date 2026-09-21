const express = require("express");
const tavilyController = require("../controllers/tavilyController");

const router = express.Router();


// GET: Lấy tất cả battler
router.post("/", tavilyController.searchInternetContextController);



module.exports = router;
