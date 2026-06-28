const express = require("express");
const videoController = require("../controllers/videoController");

const router = express.Router();

// POST: Tạo video mới
router.post("/", videoController.createVideoController);

// GET: Lấy tất cả video
router.get("/", videoController.getAllVideosController);

// GET: Lấy video theo ID
router.get("/:id", videoController.getVideoByIdController);

// PUT: Cập nhật video
router.put("/:id", videoController.updateVideoController);

// DELETE: Xóa video
router.delete("/:id", videoController.deleteVideoController);

module.exports = router;
