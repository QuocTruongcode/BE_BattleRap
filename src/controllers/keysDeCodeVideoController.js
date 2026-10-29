'use strict';

const keysDeCodeVideoService = require("../services/keysDeCodeVideoService");

const getVideoKeyController = async (req, res) => {
    const videoId = Number(req.params.videoId);

    if (!Number.isSafeInteger(videoId) || videoId <= 0) {
        return res.status(400).json({
            success: false,
            message: "ID video phải là một số nguyên dương hợp lệ",
        });
    }

    try {
        const key = await keysDeCodeVideoService.getKeyByVideoId(videoId);

        if (!key) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khóa của video",
            });
        }

        if (!/^[\da-f]{32}$/i.test(key)) {
            throw new Error("Khóa video không hợp lệ");
        }

        res.set("Content-Type", "application/octet-stream");
        res.set("Cache-Control", "no-store");
        return res.status(200).send(Buffer.from(key, "hex"));
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getVideoKeyController,
};
