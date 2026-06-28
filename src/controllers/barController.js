const barService = require("../services/barService");

// Tạo bar (1 hoặc nhiều)
const createBarController = async (req, res) => {
    try {
        const barData = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!barData) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp dữ liệu bar",
            });
        }

        // Nếu là array, kiểm tra không rỗng
        if (Array.isArray(barData) && barData.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Array bar không được để trống",
            });
        }

        // Gọi service để tạo bar
        const result = await barService.createBar(barData);

        res.status(201).json({
            success: true,
            message: Array.isArray(barData)
                ? `Tạo ${barData.length} bar thành công`
                : "Tạo bar thành công",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy tất cả bar theo videoId
const getBarsByVideoIdController = async (req, res) => {
    try {
        const { videoId } = req.params;

        // Validation videoId
        if (!videoId || isNaN(videoId)) {
            return res.status(400).json({
                success: false,
                message: "VideoId phải là một số nguyên hợp lệ",
            });
        }

        const bars = await barService.getBarsByVideoId(videoId);

        res.status(200).json({
            success: true,
            data: bars,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy bar theo ID
const getBarByIdController = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation id
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        const bar = await barService.getBarById(id);

        res.status(200).json({
            success: true,
            data: bar,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Cập nhật bar
const updateBarController = async (req, res) => {
    try {
        const { id } = req.params;
        const barData = req.body;

        // Validation id
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        // Validation dữ liệu cập nhật
        if (
            !barData.startTime &&
            barData.startTime !== 0 &&
            !barData.endTime &&
            barData.endTime !== 0 &&
            !barData.content &&
            !barData.videoId
        ) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ít nhất một trường để cập nhật",
            });
        }

        const bar = await barService.updateBar(id, barData);

        res.status(200).json({
            success: true,
            message: "Cập nhật bar thành công",
            data: bar,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Xóa bar
const deleteBarController = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation id
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        const result = await barService.deleteBar(id);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createBarController,
    getBarsByVideoIdController,
    getBarByIdController,
    updateBarController,
    deleteBarController,
};
