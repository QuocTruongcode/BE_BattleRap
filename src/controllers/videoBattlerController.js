const videoBattlerService = require("../services/videoBattlerService");

const createVideoBattlerController = async (req, res) => {
    try {
        const { videoID, battlerID } = req.body;

        if (!videoID || !battlerID) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp videoID và battlerID",
            });
        }

        const item = await videoBattlerService.createVideoBattler({ videoID, battlerID });

        return res.status(201).json({
            success: true,
            message: "Tạo VideoBattler thành công",
            data: item,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllVideoBattlersController = async (req, res) => {
    try {
        const items = await videoBattlerService.getAllVideoBattlers();

        return res.status(200).json({
            success: true,
            data: items,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getVideoBattlersByVideoIdController = async (req, res) => {
    try {
        const { videoID } = req.params;

        if (!videoID || isNaN(videoID)) {
            return res.status(400).json({
                success: false,
                message: "videoID phải là một số nguyên hợp lệ",
            });
        }

        const items = await videoBattlerService.getVideoBattlersByVideoId(videoID);

        return res.status(200).json({
            success: true,
            data: items,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getVideoBattlersByBattlerIdController = async (req, res) => {
    try {
        const { battlerID } = req.params;

        if (!battlerID || isNaN(battlerID)) {
            return res.status(400).json({
                success: false,
                message: "battlerID phải là một số nguyên hợp lệ",
            });
        }

        const items = await videoBattlerService.getVideoBattlersByBattlerId(battlerID);

        return res.status(200).json({
            success: true,
            data: items,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteVideoBattlerController = async (req, res) => {
    try {
        const { videoID, battlerID } = req.params;

        if (!videoID || !battlerID) {
            return res.status(400).json({
                success: false,
                message: "videoID và battlerID là bắt buộc",
            });
        }

        const result = await videoBattlerService.deleteVideoBattler(videoID, battlerID);

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createVideoBattlerController,
    getAllVideoBattlersController,
    getVideoBattlersByVideoIdController,
    getVideoBattlersByBattlerIdController,
    deleteVideoBattlerController,
};
