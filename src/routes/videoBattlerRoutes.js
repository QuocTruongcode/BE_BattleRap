const express = require("express");
const videoBattlerController = require("../controllers/videoBattlerController");

const router = express.Router();

router.post("/", videoBattlerController.createVideoBattlerController);
router.get("/", videoBattlerController.getAllVideoBattlersController);
router.get("/video/:videoID", videoBattlerController.getVideoBattlersByVideoIdController);
router.get("/battler/:battlerID", videoBattlerController.getVideoBattlersByBattlerIdController);
router.delete("/video/:videoID/battler/:battlerID", videoBattlerController.deleteVideoBattlerController);

module.exports = router;
