const express = require("express");
const barController = require("../controllers/barController");

const router = express.Router();

// POST: Tạo bar (1 hoặc nhiều)
router.post("/", barController.createBarController);

// GET: Lấy tất cả bar theo videoId
router.get("/video/:videoId", barController.getBarsByVideoIdController);

// GET: Lấy bar theo ID
router.get("/:id", barController.getBarByIdController);

// PUT: Cập nhật bar
router.put("/:id", barController.updateBarController);

// DELETE: Xóa bar
router.delete("/:id", barController.deleteBarController);

module.exports = router;
