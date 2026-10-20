const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const replyCommentController = require("../controllers/replyCommentController");

const router = express.Router();

router.get("/comment/:commentID", replyCommentController.getReplyCommentsByComment);
router.get("/:id", replyCommentController.getReplyCommentById);
router.post("/", requireAuth, replyCommentController.createReplyComment);
router.put("/:id", requireAuth, replyCommentController.updateReplyComment);
router.delete("/:id", requireAuth, replyCommentController.deleteReplyComment);

module.exports = router;
