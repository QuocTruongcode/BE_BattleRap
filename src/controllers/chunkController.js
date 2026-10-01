const chunkService = require("../services/chunkService");

const getBarChunkController = async (req, res) => {
    const { barId } = req.params;
    if (!/^\d+$/.test(barId)) {
        return res.status(400).json({
            success: false,
            message: "barId phải là một số nguyên hợp lệ",
        });
    }

    try {
        const chunk = await chunkService.createBarChunk(Number(barId));
        return res.status(200).json({
            success: true,
            data: chunk,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllBarChunksController = async (req, res) => {
    try {
        const chunks = await chunkService.createAllBarChunks();
        return res.status(200).json({
            success: true,
            data: chunks,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllVideoChunksController = async (req, res) => {
    try {
        const chunks = await chunkService.createAllVideoChunks();
        return res.status(200).json({
            success: true,
            data: chunks,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllBattlerChunksController = async (req, res) => {
    try {
        const chunks = await chunkService.createAllBattlerChunks();
        return res.status(200).json({
            success: true,
            data: chunks,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getBarChunkController,
    getAllBarChunksController,
    getAllVideoChunksController,
    getAllBattlerChunksController,
};