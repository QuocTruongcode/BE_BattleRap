// routes/search.js
const express = require("express");
const router = express.Router();
const search = require('../controllers/searchController');

router.get('/battlers', search.searchBattlers);
router.get('/dramas', search.searchDrama);
router.get('/', search.searchVideos);

module.exports = router;