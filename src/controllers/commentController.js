const commentService = require("../services/commentService");

const isPositiveInteger = (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0;
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const handleError = (res, error, operation) => {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
        console.error(`${operation} error:`, error);
    }
    return res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 ? "Đã xảy ra lỗi khi xử lý bình luận" : error.message
    });
};

const getCommentsByVideo = async (req, res) => {
    const { videoID } = req.params;
    if (!isPositiveInteger(videoID)) {
        return res.status(400).json({ success: false, message: "videoID phải là số nguyên dương" });
    }

    try {
        const comments = await commentService.getCommentsByVideo(Number(videoID));
        return res.status(200).json({ success: true, data: comments });
    } catch (error) {
        return handleError(res, error, "getCommentsByVideo");
    }
};

const getCommentById = async (req, res) => {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
        return res.status(400).json({ success: false, message: "id phải là số nguyên dương" });
    }

    try {
        const comment = await commentService.getCommentById(Number(id));
        return res.status(200).json({ success: true, data: comment });
    } catch (error) {
        return handleError(res, error, "getCommentById");
    }
};

const createComment = async (req, res) => {
    const { videoID, barID, content } = req.body || {};
    const allowedFields = ["videoID", "barID", "content"];
    if (!req.body || Array.isArray(req.body) || Object.keys(req.body).some((field) => !allowedFields.includes(field))) {
        return res.status(400).json({ success: false, message: "Dữ liệu bình luận không hợp lệ" });
    }
    if (!isPositiveInteger(videoID)) {
        return res.status(400).json({ success: false, message: "videoID phải là số nguyên dương" });
    }
    if (barID !== undefined && barID !== null && !isPositiveInteger(barID)) {
        return res.status(400).json({ success: false, message: "barID phải là số nguyên dương hoặc null" });
    }
    if (!isNonEmptyString(content)) {
        return res.status(400).json({ success: false, message: "content không được để trống" });
    }
    try {
        const comment = await commentService.createComment({
            videoID: Number(videoID),
            barID: barID == null ? null : Number(barID),
            userID: Number(req.user.userId),
            content: content.trim()
        });
        return res.status(201).json({ success: true, data: comment });
    } catch (error) {
        return handleError(res, error, "createComment");
    }
};

const updateComment = async (req, res) => {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
        return res.status(400).json({ success: false, message: "id phải là số nguyên dương" });
    }

    const body = req.body || {};
    const fields = Object.keys(body);
    if (Array.isArray(body) || fields.length === 0 || fields.some((field) => !["content", "barID"].includes(field))) {
        return res.status(400).json({
            success: false,
            message: "Chỉ được cập nhật content hoặc barID và phải cung cấp ít nhất một trường"
        });
    }
    if (Object.hasOwn(body, "content") && !isNonEmptyString(body.content)) {
        return res.status(400).json({ success: false, message: "content không được để trống" });
    }
    if (Object.hasOwn(body, "barID") && body.barID !== null && !isPositiveInteger(body.barID)) {
        return res.status(400).json({ success: false, message: "barID phải là số nguyên dương hoặc null" });
    }
    const changes = { ...body };
    if (Object.hasOwn(changes, "content")) changes.content = changes.content.trim();
    if (Object.hasOwn(changes, "barID") && changes.barID !== null) changes.barID = Number(changes.barID);

    try {
        const comment = await commentService.updateComment(Number(id), Number(req.user.userId), changes);
        return res.status(200).json({ success: true, data: comment });
    } catch (error) {
        return handleError(res, error, "updateComment");
    }
};

const deleteComment = async (req, res) => {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
        return res.status(400).json({ success: false, message: "id phải là số nguyên dương" });
    }

    try {
        await commentService.deleteComment(Number(id), Number(req.user.userId));
        return res.status(200).json({ success: true, message: "Đã xóa bình luận" });
    } catch (error) {
        return handleError(res, error, "deleteComment");
    }
};

module.exports = {
    getCommentsByVideo,
    getCommentById,
    createComment,
    updateComment,
    deleteComment
};
