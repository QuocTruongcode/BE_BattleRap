const { Video } = require("../../models");

// Tạo video mới
const createVideo = async (videoData) => {
    try {
        const video = await Video.create({
            title: videoData.title,
            linkVideo: videoData.linkVideo,
            thumbnailUrl: videoData.thumbnailUrl,
            battlerID: videoData.battlerID,
            review: videoData.review,
            eventID: videoData.eventID,
            cleanScore: videoData.cleanScore,
        });
        return video;
    } catch (error) {
        throw new Error(`Lỗi khi tạo video: ${error.message}`);
    }
};

// Lấy tất cả video
const getAllVideos = async () => {
    try {
        const videos = await Video.findAll({
            order: [['createdAt', 'DESC']] // 👈 mới nhất lên trên
        });
        return videos;
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách video: ${error.message}`);
    }
};

// Lấy video theo ID
const getVideoById = async (id) => {
    try {
        const video = await Video.findByPk(id);
        if (!video) {
            throw new Error("Video không tồn tại");
        }
        return video;
    } catch (error) {
        throw new Error(`Lỗi khi lấy video: ${error.message}`);
    }
};

// Cập nhật video
const updateVideo = async (id, videoData) => {
    try {
        const video = await Video.findByPk(id);
        if (!video) {
            throw new Error("Video không tồn tại");
        }
        await video.update(videoData);
        return video;
    } catch (error) {
        throw new Error(`Lỗi khi cập nhật video: ${error.message}`);
    }
};

// Xóa video
const deleteVideo = async (id) => {
    try {
        const video = await Video.findByPk(id);
        if (!video) {
            throw new Error("Video không tồn tại");
        }
        await video.destroy();
        return { message: "Xóa video thành công" };
    } catch (error) {
        throw new Error(`Lỗi khi xóa video: ${error.message}`);
    }
};

module.exports = {
    createVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
};
