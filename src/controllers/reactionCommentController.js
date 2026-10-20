const reactionCommentService = require("../services/reactionCommentService");

const isPositiveInteger = (value) =>
    (typeof value === "number" || (typeof value === "string" && value.trim() !== "")) &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) > 0;

const isValidReaction = (value) => value === null || value === 0 || value === 1;

const handleError = (res, error, operation) => {
    if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
            success: false,
            message: "Bạn đã reaction bình luận này rồi"
        });
    }
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
        console.error(`${operation} error:`, error);
    }
    return res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 ? "Đã xảy ra lỗi khi xử lý reaction" : error.message
    });
};

const getReactionCommentsByComment = async (req, res) => {
    const { commentID } = req.params;
    if (!isPositiveInteger(commentID)) {
        return res.status(400).json({ success: false, message: "commentID phải là số nguyên dương" });
    }
    try {
        const reactions = await reactionCommentService.getReactionCommentsByComment(Number(commentID));
        return res.status(200).json({ success: true, data: reactions });
    } catch (error) {
        return handleError(res, error, "getReactionCommentsByComment");
    }
};

const getReactionCommentsByReply = async (req, res) => {
    const { replyCommentID } = req.params;
    if (!isPositiveInteger(replyCommentID)) {
        return res.status(400).json({ success: false, message: "replyCommentID phải là số nguyên dương" });
    }
    try {
        const reactions = await reactionCommentService.getReactionCommentsByReply(Number(replyCommentID));
        return res.status(200).json({ success: true, data: reactions });
    } catch (error) {
        return handleError(res, error, "getReactionCommentsByReply");
    }
};

const getMyCommentReactions = async (req, res) => {
    try {
        const reactions = await reactionCommentService.getUserCommentReactions(Number(req.user.userId));
        return res.status(200).json({ success: true, data: reactions });
    } catch (error) {
        return handleError(res, error, "getMyCommentReactions");
    }
};

const getReactionCommentById = async (req, res) => {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
        return res.status(400).json({ success: false, message: "id phải là số nguyên dương" });
    }
    try {
        const reaction = await reactionCommentService.getReactionCommentById(Number(id));
        return res.status(200).json({ success: true, data: reaction });
    } catch (error) {
        return handleError(res, error, "getReactionCommentById");
    }
};

const upsertReactionComment = async (req, res) => {
    const body = req.body;
    const allowedFields = ["commentID", "replyCommentID", "reaction"];
    if (!body || Array.isArray(body) || Object.keys(body).some((field) => !allowedFields.includes(field))) {
        return res.status(400).json({ success: false, message: "Dữ liệu reaction không hợp lệ" });
    }
    const hasComment = body.commentID !== undefined && body.commentID !== null;
    const hasReply = body.replyCommentID !== undefined && body.replyCommentID !== null;
    if (hasComment === hasReply) {
        return res.status(400).json({
            success: false,
            message: "Phải cung cấp đúng một trong hai trường commentID hoặc replyCommentID"
        });
    }
    if (hasComment && !isPositiveInteger(body.commentID)) {
        return res.status(400).json({ success: false, message: "commentID phải là số nguyên dương" });
    }
    if (hasReply && !isPositiveInteger(body.replyCommentID)) {
        return res.status(400).json({ success: false, message: "replyCommentID phải là số nguyên dương" });
    }
    if (!Object.hasOwn(body, "reaction") || !isValidReaction(body.reaction)) {
        return res.status(400).json({ success: false, message: "reaction chỉ được là 0, 1 hoặc null" });
    }

    try {
        const result = await reactionCommentService.upsertReactionComment({
            userID: Number(req.user.userId),
            commentID: hasComment ? Number(body.commentID) : null,
            replyCommentID: hasReply ? Number(body.replyCommentID) : null,
            reaction: body.reaction
        });
        return res.status(result.created ? 201 : 200).json({
            success: true,
            message: result.created ? "Đã tạo reaction" : "Đã cập nhật reaction",
            data: result.reaction
        });
    } catch (error) {
        return handleError(res, error, "upsertReactionComment");
    }
};

const updateReactionComment = async (req, res) => {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
        return res.status(400).json({ success: false, message: "id phải là số nguyên dương" });
    }
    const body = req.body;
    if (!body || Array.isArray(body) || Object.keys(body).length !== 1 || !Object.hasOwn(body, "reaction")) {
        return res.status(400).json({ success: false, message: "Chỉ được cập nhật trường reaction" });
    }
    if (!isValidReaction(body.reaction)) {
        return res.status(400).json({ success: false, message: "reaction chỉ được là 0, 1 hoặc null" });
    }

    try {
        const reaction = await reactionCommentService.updateReactionComment(
            Number(id),
            Number(req.user.userId),
            body.reaction
        );
        return res.status(200).json({ success: true, data: reaction });
    } catch (error) {
        return handleError(res, error, "updateReactionComment");
    }
};

const deleteReactionComment = async (req, res) => {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
        return res.status(400).json({ success: false, message: "id phải là số nguyên dương" });
    }
    try {
        await reactionCommentService.deleteReactionComment(Number(id), Number(req.user.userId));
        return res.status(200).json({ success: true, message: "Đã xóa reaction" });
    } catch (error) {
        return handleError(res, error, "deleteReactionComment");
    }
};

module.exports = {
    getReactionCommentsByComment,
    getReactionCommentsByReply,
    getMyCommentReactions,
    getReactionCommentById,
    upsertReactionComment,
    updateReactionComment,
    deleteReactionComment
};
