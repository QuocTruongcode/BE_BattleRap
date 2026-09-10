const express = require("express");
const barReactionController = require("../controllers/barReactionController");

const router = express.Router();

// POST: Tạo BarReaction
router.post("/", barReactionController.createBarReactionController);

// POST: Tạo nhiều BarReaction
router.post("/bulk", barReactionController.createBarReactionsController);

// GET: Lấy tất cả BarReaction
router.get("/", barReactionController.getAllBarReactionsController);

// GET: Lấy theo barID
router.get("/bar/:barId", barReactionController.getBarReactionsByBarIdController);

// GET: Lấy theo userID và videoID
router.get("/user/:userId/video/:videoId", barReactionController.getBarReactionsByUserAndVideoController);

// GET: Lấy theo ID
router.get("/:id", barReactionController.getBarReactionByIdController);

// PUT: Cập nhật
router.put("/:id", barReactionController.updateBarReactionController);

// DELETE: Xóa
router.delete("/:id", barReactionController.deleteBarReactionController);

module.exports = router;
