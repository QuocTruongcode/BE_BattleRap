const express = require("express");
const chunkController = require("../controllers/chunkController");

const router = express.Router();

router.get("/bars", chunkController.getAllBarChunksController);
router.get("/videos", chunkController.getAllVideoChunksController);
router.get("/battlers", chunkController.getAllBattlerChunksController);
router.get("/bar/:barId", chunkController.getBarChunkController);

module.exports = router;