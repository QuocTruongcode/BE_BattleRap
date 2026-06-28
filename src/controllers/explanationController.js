const explanationService = require("../services/explanationService");

// Tạo explanation (1 hoặc nhiều)
const createExplanationController = async (req, res) => {
    try {
        const explanationData = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!explanationData) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp dữ liệu explanation",
            });
        }

        // Nếu là array, kiểm tra không rỗng
        if (Array.isArray(explanationData) && explanationData.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Array explanation không được để trống",
            });
        }

        // Gọi service để tạo explanation
        const result = await explanationService.createExplanation(explanationData);

        res.status(201).json({
            success: true,
            message: Array.isArray(explanationData)
                ? `Tạo ${explanationData.length} explanation thành công`
                : "Tạo explanation thành công",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy tất cả explanation theo barId
const getExplanationsByBarIdController = async (req, res) => {
    try {
        const { barId } = req.params;

        // Validation barId
        if (!barId || isNaN(barId)) {
            return res.status(400).json({
                success: false,
                message: "BarId phải là một số nguyên hợp lệ",
            });
        }

        const explanations = await explanationService.getExplanationsByBarId(barId);

        res.status(200).json({
            success: true,
            data: explanations,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy explanation theo ID
const getExplanationByIdController = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation id
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        const explanation = await explanationService.getExplanationById(id);

        res.status(200).json({
            success: true,
            data: explanation,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Cập nhật explanation
const updateExplanationController = async (req, res) => {
    try {
        const { id } = req.params;
        const explanationData = req.body;

        // Validation id
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        // Kiểm tra dữ liệu đầu vào
        if (!explanationData || Object.keys(explanationData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp dữ liệu explanation để cập nhật",
            });
        }

        const updatedExplanation = await explanationService.updateExplanation(id, explanationData);

        res.status(200).json({
            success: true,
            message: "Cập nhật explanation thành công",
            data: updatedExplanation,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Xóa explanation
const deleteExplanationController = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation id
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        const result = await explanationService.deleteExplanation(id);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy tất cả explanation
const getAllExplanationsController = async (req, res) => {
    try {
        const explanations = await explanationService.getAllExplanations();

        res.status(200).json({
            success: true,
            data: explanations,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createExplanationController,
    getExplanationsByBarIdController,
    getExplanationByIdController,
    updateExplanationController,
    deleteExplanationController,
    getAllExplanationsController,
};
