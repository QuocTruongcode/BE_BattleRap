const axios = require("axios");

const chunkService = require("../services/chunkService");

const AI_SERVER_URL = process.env.AI_SERVER_URL;

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

const getBarChunksByVideoIdController = async (req, res) => {
    const { videoID } = req.params;
    if (!/^\d+$/.test(videoID)) {
        return res.status(400).json({
            success: false,
            message: "videoID phải là một số nguyên hợp lệ",
        });
    }

    try {
        const chunks = await chunkService.createChunksByVideoId(Number(videoID));
        if (!chunks) {
            return res.status(404).json({
                success: false,
                message: "Video không tồn tại",
            });
        }

        const response = await axios.post(
            `${AI_SERVER_URL}/api/chunks/bars/embed`,
            { data: chunks },
        );


        return res.status(200).json({
            success: true,
            data: response.data,
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

const getDramaChunkController = async (req, res) => {
    const { dramaID } = req.params;
    if (!/^\d+$/.test(dramaID) || Number(dramaID) < 1) {
        return res.status(400).json({
            success: false,
            message: "dramaID phải là một số nguyên dương hợp lệ",
        });
    }

    try {
        const chunk = await chunkService.createDramaChunk(Number(dramaID));
        if (!chunk) {
            return res.status(404).json({
                success: false,
                message: "Drama không tồn tại",
            });
        }

        return res.status(200).json({
            success: true,
            data: chunk,
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
    getBarChunksByVideoIdController,
    getAllVideoChunksController,
    getAllBattlerChunksController,
    getDramaChunkController,
};