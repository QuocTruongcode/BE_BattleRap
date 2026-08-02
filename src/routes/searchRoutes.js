// routes/search.js
const express = require("express");
const router = express.Router();
const search = require('../controllers/searchController');

router.get('/', search.searchVideos);

module.exports = router;