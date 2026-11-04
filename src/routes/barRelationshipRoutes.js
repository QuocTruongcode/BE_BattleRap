const express = require("express");
const barRelationshipController = require("../controllers/barRelationshipController");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// POST: Tạo mới BarRelationship
router.post("/", requireRole("U0"), barRelationshipController.createBarRelationshipController);

// GET: Lấy tất cả BarRelationship
router.get("/", barRelationshipController.getAllBarRelationshipsController);

// GET: Lấy danh sách BarRelationship theo SourceBarID
router.get("/source-bar/:sourceBarId", barRelationshipController.getBarRelationshipsBySourceBarIdController);

// GET: Lấy BarRelationship theo ID
router.get("/:id", barRelationshipController.getBarRelationshipByIdController);

// PUT: Cập nhật BarRelationship
router.put("/:id", requireRole("U0"), barRelationshipController.updateBarRelationshipController);

// DELETE: Xóa BarRelationship
router.delete("/:id", requireRole("U0"), barRelationshipController.deleteBarRelationshipController);

module.exports = router;
