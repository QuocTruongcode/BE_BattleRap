const express = require("express");
const chunkController = require("../controllers/chunkController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.get("/bars", requireRole("U0"), chunkController.getAllBarChunksController);
router.get("/video/:videoID/bars", requireRole("U0"), chunkController.getBarChunksByVideoIdController);
router.get("/videos", requireRole("U0"), chunkController.getAllVideoChunksController);
router.get("/battlers", requireRole("U0"), chunkController.getAllBattlerChunksController);
router.get("/bar/:barId", requireRole("U0"), chunkController.getBarChunkController);
router.get("/drama/:dramaID", requireRole("U0"), chunkController.getDramaChunkController);

module.exports = router;