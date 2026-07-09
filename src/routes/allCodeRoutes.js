const express = require("express");
const allCodeController = require("../controllers/allCodeController");

const router = express.Router();

router.post("/", allCodeController.createAllCodeController);
router.get("/", allCodeController.getAllCodesController);
router.get("/:id", allCodeController.getAllCodeByIdController);
router.put("/:id", allCodeController.updateAllCodeController);
router.delete("/:id", allCodeController.deleteAllCodeController);

module.exports = router;
