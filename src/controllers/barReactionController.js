const barReactionService = require("../services/barReactionService");

// Tạo BarReaction
const createBarReactionController = async (req, res) => {
    try {
        const barReactionData = req.body;

        if (!barReactionData) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp dữ liệu BarReaction" });
        }

        const barReaction = await barReactionService.createBarReaction(barReactionData);
        res.status(201).json({ success: true, message: "Tạo BarReaction thành công", data: barReaction });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Tạo nhiều BarReaction
const createBarReactionsController = async (req, res) => {
    try {
        const barReactions = Array.isArray(req.body) ? req.body : req.body?.barReactions;

        if (!Array.isArray(barReactions) || barReactions.length === 0) {
            return res.status(400).json({ success: false, message: "barReactions phải là một danh sách không rỗng" });
        }

        const items = await barReactionService.createBarReactions(barReactions);
        res.status(201).json({ success: true, message: "Tạo nhiều BarReaction thành công", data: items });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Lấy tất cả BarReaction
const getAllBarReactionsController = async (req, res) => {
    try {
        const items = await barReactionService.getAllBarReactions();
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy BarReaction theo ID
const getBarReactionByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "ID phải là một số nguyên hợp lệ" });

        const item = await barReactionService.getBarReactionById(id);
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// Lấy danh sách theo barID
const getBarReactionsByBarIdController = async (req, res) => {
    try {
        const { barId } = req.params;
        if (!barId || isNaN(barId)) return res.status(400).json({ success: false, message: "barId phải là một số nguyên hợp lệ" });

        const items = await barReactionService.getBarReactionsByBarId(barId);
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật BarReaction
const updateBarReactionController = async (req, res) => {
    try {
        const { id } = req.params;
        const barReactionData = req.body;
        if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "ID phải là một số nguyên hợp lệ" });

        if (!barReactionData || Object.keys(barReactionData).length === 0) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp ít nhất một trường để cập nhật" });
        }

        const updated = await barReactionService.updateBarReaction(id, barReactionData);
        res.status(200).json({ success: true, message: "Cập nhật BarReaction thành công", data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Xóa BarReaction
const deleteBarReactionController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "ID phải là một số nguyên hợp lệ" });

        const result = await barReactionService.deleteBarReaction(id);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createBarReactionController,
    createBarReactionsController,
    getAllBarReactionsController,
    getBarReactionByIdController,
    getBarReactionsByBarIdController,
    updateBarReactionController,
    deleteBarReactionController,
};
