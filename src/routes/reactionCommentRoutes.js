const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const reactionCommentController = require("../controllers/reactionCommentController");

const router = express.Router();

router.get("/comment/:commentID", reactionCommentController.getReactionCommentsByComment);
router.get("/reply/:replyCommentID", reactionCommentController.getReactionCommentsByReply);
router.get("/mine", requireAuth, reactionCommentController.getMyCommentReactions);
router.get("/:id", reactionCommentController.getReactionCommentById);
router.post("/", requireAuth, reactionCommentController.upsertReactionComment);
router.put("/:id", requireAuth, reactionCommentController.updateReactionComment);
router.delete("/:id", requireAuth, reactionCommentController.deleteReactionComment);

module.exports = router;
