const dramaService = require("../services/dramaService");

const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;
const isValidText = (value) => value === null || typeof value === "string";
const sendError = (res, error) => {
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
    });
};

const createDramaController = async (req, res) => {
    const dramaData = req.body;
    if (!dramaData || typeof dramaData !== "object" || Array.isArray(dramaData)) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp dữ liệu drama",
        });
    }
    if (Object.keys(dramaData).some((field) => !["title", "summary"].includes(field))) {
        return res.status(400).json({
            success: false,
            message: "Chỉ hỗ trợ các trường title và summary",
        });
    }
    const { title, summary } = dramaData;
    if ((title !== undefined && !isValidText(title))
        || (summary !== undefined && !isValidText(summary))) {
        return res.status(400).json({
            success: false,
            message: "title và summary phải là chuỗi hoặc null",
        });
    }

    try {
        const drama = await dramaService.createDrama({ title, summary });
        return res.status(201).json({
            success: true,
            message: "Tạo drama thành công",
            data: drama,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const getAllDramasController = async (req, res) => {
    try {
        const dramas = await dramaService.getAllDramas();
        return res.status(200).json({ success: true, data: dramas });
    } catch (error) {
        return sendError(res, error);
    }
};

const getDramaByIdController = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "ID phải là một số nguyên dương hợp lệ",
        });
    }

    try {
        const drama = await dramaService.getDramaById(Number(id));
        return res.status(200).json({ success: true, data: drama });
    } catch (error) {
        return sendError(res, error);
    }
};

const updateDramaController = async (req, res) => {
    const { id } = req.params;
    const dramaData = req.body;
    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "ID phải là một số nguyên dương hợp lệ",
        });
    }
    if (!dramaData || typeof dramaData !== "object" || Array.isArray(dramaData)) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp dữ liệu drama cần cập nhật",
        });
    }

    const fields = Object.keys(dramaData);
    if (fields.length === 0 || fields.some((field) => !["title", "summary"].includes(field))) {
        return res.status(400).json({
            success: false,
            message: "Chỉ có thể cập nhật title và summary",
        });
    }
    if (fields.some((field) => !isValidText(dramaData[field]))) {
        return res.status(400).json({
            success: false,
            message: "title và summary phải là chuỗi hoặc null",
        });
    }

    try {
        const drama = await dramaService.updateDrama(Number(id), dramaData);
        return res.status(200).json({
            success: true,
            message: "Cập nhật drama thành công",
            data: drama,
        });
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteDramaController = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
        return res.status(400).json({
            success: false,
            message: "ID phải là một số nguyên dương hợp lệ",
        });
    }

    try {
        await dramaService.deleteDrama(Number(id));
        return res.status(200).json({
            success: true,
            message: "Xóa drama thành công",
        });
    } catch (error) {
        return sendError(res, error);
    }
};

module.exports = {
    createDramaController,
    getAllDramasController,
    getDramaByIdController,
    updateDramaController,
    deleteDramaController,
};
