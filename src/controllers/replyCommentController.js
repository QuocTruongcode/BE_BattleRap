const replyCommentService = require("../services/replyCommentService");

const isPositiveInteger = (value) =>
    (typeof value === "number" || (typeof value === "string" && value.trim() !== "")) &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) > 0;

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const handleError = (res, error, operation) => {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
        console.error(`${operation} error:`, error);
    }
    return res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 ? "Đã xảy ra lỗi khi xử lý trả lời bình luận" : error.message
    });
};

const getReplyCommentsByComment = async (req, res) => {
    const { commentID } = req.params;
    if (!isPositiveInteger(commentID)) {
        return res.status(400).json({ success: false, message: "commentID phải là số nguyên dương" });
    }
    try {
        const replies = await replyCommentService.getReplyCommentsByComment(Number(commentID));
        return res.status(200).json({ success: true, data: replies });
    } catch (error) {
        return handleError(res, error, "getReplyCommentsByComment");
    }
};

const getReplyCommentById = async (req, res) => {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
        return res.status(400).json({ success: false, message: "id phải là số nguyên dương" });
    }
    try {
        const reply = await replyCommentService.getReplyCommentById(Number(id));
        return res.status(200).json({ success: true, data: reply });
    } catch (error) {
        return handleError(res, error, "getReplyCommentById");
    }
};

const createReplyComment = async (req, res) => {
    const body = req.body;
    const allowedFields = ["commentID", "replyUserID", "content"];
    if (!body || Array.isArray(body) || Object.keys(body).some((field) => !allowedFields.includes(field))) {
        return res.status(400).json({ success: false, message: "Dữ liệu trả lời bình luận không hợp lệ" });
    }
    if (!isPositiveInteger(body.commentID)) {
        return res.status(400).json({ success: false, message: "commentID phải là số nguyên dương" });
    }
    if (!isPositiveInteger(body.replyUserID)) {
        return res.status(400).json({ success: false, message: "replyUserID phải là số nguyên dương" });
    }
    if (!isNonEmptyString(body.content)) {
        return res.status(400).json({ success: false, message: "content không được để trống" });
    }

    try {
        const reply = await replyCommentService.createReplyComment({
            commentID: Number(body.commentID),
            userID: Number(req.user.userId),
            replyUserID: Number(body.replyUserID),
            content: body.content.trim()
        });
        return res.status(201).json({ success: true, data: reply });
    } catch (error) {
        return handleError(res, error, "createReplyComment");
    }
};

const updateReplyComment = async (req, res) => {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
        return res.status(400).json({ success: false, message: "id phải là số nguyên dương" });
    }
    const body = req.body;
    if (!body || Array.isArray(body) || Object.keys(body).length !== 1 || !Object.hasOwn(body, "content")) {
        return res.status(400).json({ success: false, message: "Chỉ được cập nhật trường content" });
    }
    if (!isNonEmptyString(body.content)) {
        return res.status(400).json({ success: false, message: "content không được để trống" });
    }

    try {
        const reply = await replyCommentService.updateReplyComment(
            Number(id),
            Number(req.user.userId),
            body.content.trim()
        );
        return res.status(200).json({ success: true, data: reply });
    } catch (error) {
        return handleError(res, error, "updateReplyComment");
    }
};

const deleteReplyComment = async (req, res) => {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
        return res.status(400).json({ success: false, message: "id phải là số nguyên dương" });
    }
    try {
        await replyCommentService.deleteReplyComment(Number(id), Number(req.user.userId));
        return res.status(200).json({ success: true, message: "Đã xóa trả lời bình luận" });
    } catch (error) {
        return handleError(res, error, "deleteReplyComment");
    }
};

module.exports = {
    getReplyCommentsByComment,
    getReplyCommentById,
    createReplyComment,
    updateReplyComment,
    deleteReplyComment
};
