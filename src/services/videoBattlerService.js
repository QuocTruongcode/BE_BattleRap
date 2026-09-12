const { VideoBattler, Video, Battler } = require("../../models");

const checkVideoExists = async (videoID) => {
    const video = await Video.findByPk(videoID);
    if (!video) {
        throw new Error(`Video với ID ${videoID} không tồn tại`);
    }
};

const checkBattlerExists = async (battlerID) => {
    const battler = await Battler.findByPk(battlerID);
    if (!battler) {
        throw new Error(`Battler với ID ${battlerID} không tồn tại`);
    }
};

const createVideoBattler = async (videoBattlerData) => {
    try {
        const videoID = Number(videoBattlerData?.videoID);
        const battlerID = Number(videoBattlerData?.battlerID);

        if (!videoBattlerData || !videoID || !battlerID) {
            throw new Error("Vui lòng cung cấp videoID và battlerID hợp lệ");
        }

        await checkVideoExists(videoID);
        await checkBattlerExists(battlerID);

        const existing = await VideoBattler.findOne({
            where: { videoID, battlerID },
        });

        if (existing) {
            throw new Error("Quan hệ VideoBattler này đã tồn tại");
        }

        const item = await VideoBattler.create({ videoID, battlerID });
        return item;
    } catch (error) {
        throw new Error(`Lỗi khi tạo VideoBattler: ${error.message}`);
    }
};

const getAllVideoBattlers = async () => {
    try {
        return await VideoBattler.findAll({
            include: [
                { model: Video, as: "Video" },
                { model: Battler, as: "Battler" },
            ],
        });
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách VideoBattler: ${error.message}`);
    }
};

const getVideoBattlersByVideoId = async (videoID) => {
    try {
        const id = Number(videoID);
        if (!id || isNaN(id)) {
            throw new Error("videoID phải là một số nguyên hợp lệ");
        }

        return await VideoBattler.findAll({
            where: { videoID: id },
            include: [{ model: Battler, as: "Battler" }],
        });
    } catch (error) {
        throw new Error(`Lỗi khi lấy VideoBattler theo videoID: ${error.message}`);
    }
};

const getVideoBattlersByBattlerId = async (battlerID) => {
    try {
        const id = Number(battlerID);
        if (!id || isNaN(id)) {
            throw new Error("battlerID phải là một số nguyên hợp lệ");
        }

        return await VideoBattler.findAll({
            where: { battlerID: id },
            include: [{ model: Video, as: "Video" }],
        });
    } catch (error) {
        throw new Error(`Lỗi khi lấy VideoBattler theo battlerID: ${error.message}`);
    }
};

const deleteVideoBattler = async (videoID, battlerID) => {
    try {
        const vId = Number(videoID);
        const bId = Number(battlerID);

        if (!vId || !bId) {
            throw new Error("videoID và battlerID là bắt buộc");
        }

        const item = await VideoBattler.findOne({
            where: { videoID: vId, battlerID: bId },
        });

        if (!item) {
            throw new Error("VideoBattler không tồn tại");
        }

        await item.destroy();
        return { message: "Xóa VideoBattler thành công" };
    } catch (error) {
        throw new Error(`Lỗi khi xóa VideoBattler: ${error.message}`);
    }
};

module.exports = {
    createVideoBattler,
    getAllVideoBattlers,
    getVideoBattlersByVideoId,
    getVideoBattlersByBattlerId,
    deleteVideoBattler,
};
