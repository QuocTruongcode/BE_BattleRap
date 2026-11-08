const express = require("express");
const allCodeController = require("../controllers/allCodeController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.post("/", requireRole("U0"), allCodeController.createAllCodeController);
router.get("/", allCodeController.getAllCodesController);
router.get("/type/:type", allCodeController.getAllCodeByTypeController);
router.get("/:id", allCodeController.getAllCodeByIdController);
router.put("/:id", requireRole("U0"), allCodeController.updateAllCodeController);
router.delete("/:id", requireRole("U0"), allCodeController.deleteAllCodeController);

module.exports = router;
