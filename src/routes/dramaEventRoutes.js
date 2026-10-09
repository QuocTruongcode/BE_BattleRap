const express = require("express");
const dramaEventController = require("../controllers/dramaEventController");

const router = express.Router();

router.post("/", dramaEventController.createDramaEventController);
router.post("/bulk", dramaEventController.bulkCreateDramaEventsController);
router.get("/", dramaEventController.getAllDramaEventsController);
router.get("/drama/:dramaID", dramaEventController.getAllDramaEventByDramaIDController);
router.get("/video/:videoID", dramaEventController.getAllDramaEventByVideoIDController);
router.get("/:id", dramaEventController.getDramaEventByIdController);
router.put("/:id", dramaEventController.updateDramaEventController);
router.delete("/:id", dramaEventController.deleteDramaEventController);

module.exports = router;
