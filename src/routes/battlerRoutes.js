const express = require("express");
const battlerController = require("../controllers/battlerController");

const router = express.Router();

// POST: Tạo battler mới
router.post("/", battlerController.createBattlerController);

// GET: Lấy tất cả battler
router.get("/", battlerController.getAllBattlersController);

// GET: Lấy battler theo ID
router.get("/:id", battlerController.getBattlerByIdController);

// PUT: Cập nhật battler
router.put("/:id", battlerController.updateBattlerController);

// DELETE: Xóa battler
router.delete("/:id", battlerController.deleteBattlerController);

module.exports = router;
