const { Video, Bar, KeyR2, User, sequelize } = require("../../models");
const hasNonEmptyValue = (value) => value !== undefined
    && value !== null
    && String(value).trim() !== "";

// Tạo video mới
const createVideo = async (videoData, options = {}) => {
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
            storageId: videoData.storageId ?? videoData.storageID ?? null,
            status: videoData.status === undefined ? 0 : videoData.status,
        }, { transaction: options.transaction });
        return video;
    } catch (error) {
        throw new Error(`Lỗi khi tạo video: ${error.message}`);
    }
};

// Lấy tất cả video
const getAllVideos = async ({ includeNonZeroStatus = true } = {}) => {
    try {
        const [videos, barCounts] = await Promise.all([
            Video.findAll({
                ...(includeNonZeroStatus ? {} : { where: { status: 0 } }),
                order: [['createdAt', 'DESC']] // 👈 mới nhất lên trên
            }),
            Bar.findAll({
                attributes: [
                    'videoId',
                    [sequelize.fn('SUM', sequelize.col('totalReaction')), 'totalReaction'],
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
                totalReaction: Number(counts?.totalReaction ?? 0),
                barScoreCounts: [
                    { range: 'genius', count: Number(counts?.above9 ?? 0) },
                    { range: 'great', count: Number(counts?.from7To9 ?? 0) },
                    { range: 'boring', count: Number(counts?.above2To4 ?? 0) },
                    { range: 'bad', count: Number(counts?.from0ToBelow2 ?? 0) },
                ],
            };
        }).sort((firstVideo, secondVideo) => secondVideo.totalReaction - firstVideo.totalReaction);
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách video: ${error.message}`);
    }
};

// Lấy video theo ID
const getVideoById = async (id, userId) => {
    try {
        const video = await Video.findByPk(id);
        if (!video) {
            throw new Error("Video không tồn tại");
        }

        const user = userId ? await User.findByPk(userId) : null;
        const userScore = Number(user?.score);
        const requiredScore = Number(video.cleanScore ?? 0);

        if (!user || !Number.isFinite(userScore)
            || !Number.isFinite(requiredScore)
            || userScore < requiredScore) {
            const videoData = video.toJSON();
            delete videoData.linkVideo;
            delete videoData.storageId;
            return videoData;
        }

        return video;
    } catch (error) {
        throw new Error(`Lỗi khi lấy video: ${error.message}`);
    }
};

// Cập nhật video
const updateVideo = async (id, videoData, options = {}) => {
    try {
        const updateInTransaction = async (transaction) => {
            const video = await Video.findByPk(id, { transaction });
            if (!video) {
                throw new Error("Video không tồn tại");
            }

            const updateData = { ...videoData };
            if (!hasNonEmptyValue(updateData.storageId)) {
                delete updateData.storageId;
            }
            await video.update(updateData, { transaction });

            if (hasNonEmptyValue(options.key)) {
                const keyRecord = await KeyR2.findOne({
                    where: { VideoID: video.id },
                    transaction
                });

                if (keyRecord) {
                    await keyRecord.update({ key: options.key }, { transaction });
                } else {
                    await KeyR2.create(
                        { VideoID: video.id, key: options.key },
                        { transaction }
                    );
                }
            }

            return video;
        };

        return options.transaction
            ? await updateInTransaction(options.transaction)
            : await sequelize.transaction(updateInTransaction);
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
