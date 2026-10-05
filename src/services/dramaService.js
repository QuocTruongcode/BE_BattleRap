const { Drama, DramaEvent } = require("../../models");

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
    getDramaById,
    updateDrama,
    deleteDrama,
};
