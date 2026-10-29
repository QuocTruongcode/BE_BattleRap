const videoService = require("../services/videoService");
const path = require("node:path");
const fs = require("node:fs/promises");
const videoProcessingService = require("../services/videoProcessingService");

// Tạo video mới
const createVideoController = async (req, res) => {
    try {
        const { title, linkVideo, linkBunny, thumbnailUrl, battlerID, review, eventID, cleanScore, storageId, FileName } = req.body;
        // console.log("Check request body: ", req.body)
        console.log("Check FileName: ", FileName)

        // Validation - kiểm tra dữ liệu đầu vào
        if (!title || !linkVideo || !thumbnailUrl) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập tiêu đề và link video, link thumnail",
            });
        }

        let fullPath = null;
        if (FileName) {
            const safeName = path.basename(String(FileName));

            fullPath = path.join(process.env.FOLDER_VIDEO_PATH, safeName);
            endPath = path.join(process.env.FOLDER_UPLOADED_VIDEO, safeName);

            try { await fs.access(fullPath); }
            catch { return res.status(400).json({ success: false, message: "Không tìm thấy file" }); }
        }

        console.log("Check fullPath: ", fullPath)

        // Gọi service để tạo video
        const video = await videoService.createVideo({
            title,
            linkVideo,
            linkBunny,
            thumbnailUrl,
            battlerID,
            review,
            eventID,
            cleanScore,
            storageId: storageId ?? null,
        });

        if (fullPath) {
            videoProcessingService.processVideoFile({
                videoId: video.id,
                fullPath,
                endPath,
                bucket: process.env.R2_BUCKET_NAME,
            });
        }

        res.status(201).json({
            success: true,
            message: "Tạo video thành công",
            data: video,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy tất cả video
const getAllVideosController = async (req, res) => {
    try {
        const videos = await videoService.getAllVideos();
        res.status(200).json({
            success: true,
            data: videos,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy video theo ID
const getVideoByIdController = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation id
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        const video = await videoService.getVideoById(id);
        res.status(200).json({
            success: true,
            data: video,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Cập nhật video
const updateVideoController = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, linkVideo, linkBunny, thumbnailUrl, battlerID, review, eventID, cleanScore, storageID, storageId } = req.body;

        // Validation id
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        // Validation dữ liệu cập nhật
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ít nhất một trường để cập nhật",
            });
        }

        const video = await videoService.updateVideo(id, {
            title,
            linkVideo,
            linkBunny,
            thumbnailUrl,
            battlerID,
            review,
            eventID,
            cleanScore,
            storageId: storageID !== undefined ? storageID : storageId,
        });

        res.status(200).json({
            success: true,
            message: "Cập nhật video thành công",
            data: video,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Xóa video
const deleteVideoController = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation id
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID phải là một số nguyên hợp lệ",
            });
        }

        const result = await videoService.deleteVideo(id);
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
    createVideoController,
    getAllVideosController,
    getVideoByIdController,
    updateVideoController,
    deleteVideoController,
};
