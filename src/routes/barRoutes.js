const express = require("express");
const barController = require("../controllers/barController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// POST: Tạo bar (1 hoặc nhiều)
router.post("/", requireRole("U0"), barController.createBarController);

// GET: Lấy tất cả bar theo videoId
router.get("/video/:videoId", barController.getBarsByVideoIdController);

// GET: Lấy nội dung bar cùng thông tin battler và video
router.get("/explainBar/:barId", barController.getBarExplanationController);

// GET: Lấy bar theo ID
router.get("/:id", barController.getBarByIdController);

// PUT: Cập nhật bar
router.put("/:id", requireRole("U0"), barController.updateBarController);

// DELETE: Xóa bar
router.delete("/:id", requireRole("U0"), barController.deleteBarController);

// DELETE ALL BAR BY VIDEOID
router.delete("/video/:videoId", requireRole("U0"), barController.deleteBarsByVideoIdController);

module.exports = router;
