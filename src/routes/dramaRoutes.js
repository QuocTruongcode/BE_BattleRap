const express = require("express");
const dramaController = require("../controllers/dramaController");

const router = express.Router();

router.post("/", dramaController.createDramaController);
router.get("/", dramaController.getAllDramasController);
router.get("/:id", dramaController.getDramaByIdController);
router.put("/:id", dramaController.updateDramaController);
router.delete("/:id", dramaController.deleteDramaController);

module.exports = router;
