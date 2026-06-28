const express = require("express");
const explanationController = require("../controllers/explanationController");

const router = express.Router();

// POST: Tạo explanation (1 hoặc nhiều)
router.post("/", explanationController.createExplanationController);

// GET: Lấy tất cả explanation
router.get("/", explanationController.getAllExplanationsController);

// GET: Lấy tất cả explanation theo barId
router.get("/bar/:barId", explanationController.getExplanationsByBarIdController);

// GET: Lấy explanation theo ID
router.get("/:id", explanationController.getExplanationByIdController);

// PUT: Cập nhật explanation
router.put("/:id", explanationController.updateExplanationController);

// DELETE: Xóa explanation
router.delete("/:id", explanationController.deleteExplanationController);

module.exports = router;
