const express = require("express");
const chunkController = require("../controllers/chunkController");

const router = express.Router();

router.get("/bars", chunkController.getAllBarChunksController);
router.get("/video/:videoID/bars", chunkController.getBarChunksByVideoIdController);
router.get("/videos", chunkController.getAllVideoChunksController);
router.get("/battlers", chunkController.getAllBattlerChunksController);
router.get("/bar/:barId", chunkController.getBarChunkController);
router.get("/drama/:dramaID", chunkController.getDramaChunkController);

module.exports = router;