const express = require("express");
const battlerController = require("../controllers/battlerController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// POST: Tạo battler mới
router.post("/", requireRole("U0"), battlerController.createBattlerController);

// GET: Lấy tất cả battler
router.get("/", battlerController.getAllBattlersController);

// GET: Lấy battler theo ID
router.get("/:id", battlerController.getBattlerByIdController);

// PUT: Cập nhật battler
router.put("/:id", requireRole("U0"), battlerController.updateBattlerController);

// DELETE: Xóa battler
router.delete("/:id", requireRole("U0"), battlerController.deleteBattlerController);

module.exports = router;
