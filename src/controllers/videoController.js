const videoService = require("../services/videoService");

// Tạo video mới
const createVideoController = async (req, res) => {
    try {
        const { title, linkVideo, thumbnailUrl, battlerID, review, eventID, cleanScore } = req.body;
        console.log("Check request body: ", req.body)
        console.log("Check thumbnailUrl: ", thumbnailUrl)

        // Validation - kiểm tra dữ liệu đầu vào
        if (!title || !linkVideo) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập tiêu đề và link video",
            });
        }

        // Gọi service để tạo video
        const video = await videoService.createVideo({
            title,
            linkVideo,
            thumbnailUrl,
            battlerID,
            review,
            eventID,
            cleanScore,
        });

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
        const { title, linkVideo, thumbnailUrl, battlerID, review, eventID, cleanScore } = req.body;

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
            thumbnailUrl,
            battlerID,
            review,
            eventID,
            cleanScore,
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
