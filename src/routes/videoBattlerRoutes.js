const express = require("express");
const videoBattlerController = require("../controllers/videoBattlerController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.post("/", requireRole("U0"), videoBattlerController.createVideoBattlerController);
router.get("/", videoBattlerController.getAllVideoBattlersController);
router.get("/video/:videoID", videoBattlerController.getVideoBattlersByVideoIdController);
router.get("/battler/:battlerID", videoBattlerController.getVideoBattlersByBattlerIdController);
router.delete("/video/:videoID/battler/:battlerID", requireRole("U0"), videoBattlerController.deleteVideoBattlerController);

module.exports = router;
