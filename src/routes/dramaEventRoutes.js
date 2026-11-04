const express = require("express");
const dramaEventController = require("../controllers/dramaEventController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.post("/", requireRole("U0"), dramaEventController.createDramaEventController);
router.post("/bulk", requireRole("U0"), dramaEventController.bulkCreateDramaEventsController);
router.get("/", dramaEventController.getAllDramaEventsController);
router.get("/drama/:dramaID", dramaEventController.getAllDramaEventByDramaIDController);
router.get("/video/:videoID", dramaEventController.getAllDramaEventByVideoIDController);
router.get("/:id", dramaEventController.getDramaEventByIdController);
router.put("/:id", requireRole("U0"), dramaEventController.updateDramaEventController);
router.delete("/:id", requireRole("U0"), dramaEventController.deleteDramaEventController);

module.exports = router;
