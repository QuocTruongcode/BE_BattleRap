const express = require("express");
const dramaController = require("../controllers/dramaController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.post("/", requireRole("U0"), dramaController.createDramaController);
router.get("/", dramaController.getAllDramasController);
router.get("/with-videos", dramaController.getDramasWithVideosController);
router.get("/:id", dramaController.getDramaByIdController);
router.put("/:id", requireRole("U0"), dramaController.updateDramaController);
router.delete("/:id", requireRole("U0"), dramaController.deleteDramaController);

module.exports = router;
