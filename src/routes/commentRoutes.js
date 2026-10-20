const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const commentController = require("../controllers/commentController");

const router = express.Router();

router.get("/video/:videoID", commentController.getCommentsByVideo);
router.get("/:id", commentController.getCommentById);
router.post("/", requireAuth, commentController.createComment);
router.put("/:id", requireAuth, commentController.updateComment);
router.delete("/:id", requireAuth, commentController.deleteComment);

module.exports = router;
