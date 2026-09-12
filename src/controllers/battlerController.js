const battlerService = require("../services/battlerService");

// Tạo battler mới
const createBattlerController = async (req, res) => {
    try {
        const { RapName, FullName, Describe, image } = req.body;

        if (!RapName || !FullName) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập RapName và FullName",
            });
        }

        const battler = await battlerService.createBattler({
            RapName,
            FullName,
            Describe,
            image,
        });

        res.status(201).json({
            success: true,
            message: "Tạo battler thành công",
            data: battler,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy tất cả battler
const getAllBattlersController = async (req, res) => {
    try {
        const battlers = await battlerService.getAllBattlers();

        res.status(200).json({
            success: true,
            data: battlers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy battler theo ID
const getBattlerByIdController = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        const battler = await battlerService.getBattlerById(id);

        res.status(200).json({
            success: true,
            data: battler,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Cập nhật battler
const updateBattlerController = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ít nhất một trường để cập nhật",
            });
        }

        const battler = await battlerService.updateBattler(id, req.body);

        res.status(200).json({
            success: true,
            message: "Cập nhật battler thành công",
            data: battler,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Xóa battler
const deleteBattlerController = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        const result = await battlerService.deleteBattler(id);

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
    createBattlerController,
    getAllBattlersController,
    getBattlerByIdController,
    updateBattlerController,
    deleteBattlerController,
};
