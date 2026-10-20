const { Drama, DramaEvent } = require("../../models");
const videoService = require("./videoService");

const createDrama = async (dramaData) => {
    return Drama.create({
        title: dramaData.title ?? null,
        summary: dramaData.summary ?? null,
    });
};

const getAllDramas = async () => {
    return Drama.findAll({
        order: [["createdAt", "DESC"]],
    });
};

const getDramasWithVideos = async () => {
    const [dramas, videos] = await Promise.all([
        Drama.findAll({
            attributes: ["id", "title"],
            include: [{
                model: DramaEvent,
                as: "DramaEvents",
                attributes: ["videoID"],
            }],
        }),
        videoService.getAllVideos(),
    ]);

    const videosById = new Map(videos.map((video) => [String(video.id), video]));

    return dramas.map((drama) => {
        const dramaData = drama.get({ plain: true });
        const dramaVideos = new Map();
        dramaData.DramaEvents.forEach(({ videoID }) => {
            const video = videosById.get(String(videoID));
            if (video) {
                dramaVideos.set(String(video.id), video);
            }
        });

        return {
            id: dramaData.id,
            title: dramaData.title,
            videos: Array.from(dramaVideos.values()),
        };
    });
};

const getDramaById = async (id) => {
    const drama = await Drama.findByPk(id, {
        include: [{
            model: DramaEvent,
            as: "DramaEvents",
        }],
    });
    if (!drama) {
        const error = new Error("Drama không tồn tại");
        error.statusCode = 404;
        throw error;
    }
    return drama;
};

const updateDrama = async (id, dramaData) => {
    const drama = await Drama.findByPk(id);
    if (!drama) {
        const error = new Error("Drama không tồn tại");
        error.statusCode = 404;
        throw error;
    }

    await drama.update({
        title: dramaData.title !== undefined ? dramaData.title : drama.title,
        summary: dramaData.summary !== undefined ? dramaData.summary : drama.summary,
    });
    return drama;
};

const deleteDrama = async (id) => {
    const drama = await Drama.findByPk(id);
    if (!drama) {
        const error = new Error("Drama không tồn tại");
        error.statusCode = 404;
        throw error;
    }

    await drama.destroy();
};

module.exports = {
    createDrama,
    getAllDramas,
    getDramasWithVideos,
    getDramaById,
    updateDrama,
    deleteDrama,
};
