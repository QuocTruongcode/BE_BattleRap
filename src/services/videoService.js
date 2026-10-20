const { Video, Bar, sequelize } = require("../../models");

// Tạo video mới
const createVideo = async (videoData) => {
    try {
        const video = await Video.create({
            title: videoData.title,
            linkVideo: videoData.linkVideo,
            linkBunny: videoData.linkBunny,
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
        const [videos, barCounts] = await Promise.all([
            Video.findAll({
                order: [['createdAt', 'DESC']] // 👈 mới nhất lên trên
            }),
            Bar.findAll({
                attributes: [
                    'videoId',
                    [sequelize.fn('COUNT', sequelize.literal('CASE WHEN [bayesianAverange] > 9 THEN 1 END')), 'above9'],
                    [sequelize.fn('COUNT', sequelize.literal('CASE WHEN [bayesianAverange] >= 7 AND [bayesianAverange] <= 9 THEN 1 END')), 'from7To9'],
                    [sequelize.fn('COUNT', sequelize.literal('CASE WHEN [bayesianAverange] > 2 AND [bayesianAverange] <= 4 THEN 1 END')), 'above2To4'],
                    [sequelize.fn('COUNT', sequelize.literal('CASE WHEN [bayesianAverange] >= 0 AND [bayesianAverange] < 2 THEN 1 END')), 'from0ToBelow2'],
                ],
                group: ['videoId'],
                raw: true,
            }),
        ]);
        const barCountsByVideoId = new Map(
            barCounts.map((counts) => [String(counts.videoId), counts])
        );

        return videos.map((video) => {
            const counts = barCountsByVideoId.get(String(video.id));

            return {
                ...video.toJSON(),
                barScoreCounts: [
                    { range: 'genius', count: Number(counts?.above9 ?? 0) },
                    { range: 'great', count: Number(counts?.from7To9 ?? 0) },
                    { range: 'boring', count: Number(counts?.above2To4 ?? 0) },
                    { range: 'bad', count: Number(counts?.from0ToBelow2 ?? 0) },
                ],
            };
        });
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
