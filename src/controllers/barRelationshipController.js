const barRelationshipService = require("../services/barRelationshipService");

// Tạo quan hệ bar mới
const createBarRelationshipController = async (req, res) => {
    try {
        const barRelationshipData = req.body;
        console.log("Received barRelationshipData:", barRelationshipData); // Log dữ liệu nhận được

        if (!barRelationshipData) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp dữ liệu quan hệ bar",
            });
        }

        const barRelationship = await barRelationshipService.createBarRelationship(barRelationshipData);
        console.log("Created barRelationship:", barRelationship); // Log dữ liệu quan hệ bar đã tạo
        res.status(201).json({
            success: true,
            message: "Tạo quan hệ bar thành công",
            data: barRelationship,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy tất cả quan hệ bar
const getAllBarRelationshipsController = async (req, res) => {
    try {
        const barRelationships = await barRelationshipService.getAllBarRelationships();
        res.status(200).json({
            success: true,
            data: barRelationships,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy quan hệ bar theo ID
const getBarRelationshipByIdController = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        const barRelationship = await barRelationshipService.getBarRelationshipById(id);

        res.status(200).json({
            success: true,
            data: barRelationship,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy quan hệ bar theo SourceBarID
const getBarRelationshipsBySourceBarIdController = async (req, res) => {
    try {
        const { sourceBarId } = req.params;

        if (!sourceBarId || isNaN(sourceBarId)) {
            return res.status(400).json({
                success: false,
                message: "SourceBarId phải là một số nguyên hợp lệ",
            });
        }

        const barRelationships = await barRelationshipService.getBarRelationshipsBySourceBarId(sourceBarId);

        res.status(200).json({
            success: true,
            data: barRelationships,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Cập nhật quan hệ bar
const updateBarRelationshipController = async (req, res) => {
    try {
        const { id } = req.params;
        const barRelationshipData = req.body;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        if (!barRelationshipData || Object.keys(barRelationshipData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ít nhất một trường để cập nhật",
            });
        }

        const barRelationship = await barRelationshipService.updateBarRelationship(id, barRelationshipData);

        res.status(200).json({
            success: true,
            message: "Cập nhật quan hệ bar thành công",
            data: barRelationship,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Xóa quan hệ bar
const deleteBarRelationshipController = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        const result = await barRelationshipService.deleteBarRelationship(id);

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
    createBarRelationshipController,
    getAllBarRelationshipsController,
    getBarRelationshipByIdController,
    getBarRelationshipsBySourceBarIdController,
    updateBarRelationshipController,
    deleteBarRelationshipController,
};
