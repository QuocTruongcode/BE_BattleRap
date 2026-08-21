const { BarReaction, Bar, AllCode } = require("../../models");

const checkBarExists = async (barId) => {
    const bar = await Bar.findByPk(barId);
    if (!bar) throw new Error(`Bar với ID ${barId} không tồn tại`);
};

const checkReactionTypeExists = async (reactionType) => {
    if (!reactionType) return;
    const rec = await AllCode.findOne({ where: { KeyMap: reactionType } });
    if (!rec) throw new Error(`ReactionType với KeyMap ${reactionType} không tồn tại`);
};

const keepLastReactionByBarId = (data) => {
    return [...data.reduce((reactionsByBarId, item) => {
        reactionsByBarId.set(item.barID, item);
        return reactionsByBarId;
    }, new Map()).values()];
};

const createBarReaction = async (data) => {
    try {
        if (!data.barID) throw new Error("barID là bắt buộc");
        if (!data.ReactionType) throw new Error("ReactionType là bắt buộc");

        await checkBarExists(data.barID);
        await checkReactionTypeExists(data.ReactionType);

        const item = await BarReaction.create({
            barID: data.barID,
            ReactionType: data.ReactionType,
        });

        return item;
    } catch (error) {
        throw new Error(`Lỗi khi tạo BarReaction: ${error.message}`);
    }
};

const createBarReactions = async (data) => {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Danh sách BarReaction không được để trống");
        }

        const uniqueData = keepLastReactionByBarId(data);

        for (const item of uniqueData) {
            if (!item || !item.barID) throw new Error("barID là bắt buộc cho mọi BarReaction");
            if (!item.ReactionType) throw new Error("ReactionType là bắt buộc cho mọi BarReaction");
        }

        const barIds = [...new Set(uniqueData.map((item) => item.barID))];
        const reactionTypes = [...new Set(uniqueData.map((item) => item.ReactionType))];
        // console.log("barIds:", barIds);
        // console.log("reactionTypes:", reactionTypes);

        const [bars, reactionTypeRecords] = await Promise.all([
            Bar.findAll({ where: { id: barIds } }),
            AllCode.findAll({ where: { KeyMap: reactionTypes } }),
        ]);

        // console.log("bars:", bars);
        // console.log("reactionTypeRecords:", reactionTypeRecords);

        const existingBarIds = new Set(bars.map((bar) => bar.id));
        // console.log("existingBarIds:", existingBarIds);
        const missingBarId = barIds.find((barId) => !existingBarIds.has(barId));
        // console.log("missingBarId:", missingBarId);
        if (missingBarId !== undefined) {
            throw new Error(`Bar với ID ${missingBarId} không tồn tại`);
        }

        const existingReactionTypes = new Set(reactionTypeRecords.map((record) => record.KeyMap));
        const missingReactionType = reactionTypes.find((type) => !existingReactionTypes.has(type));
        if (missingReactionType !== undefined) {
            throw new Error(`ReactionType với KeyMap ${missingReactionType} không tồn tại`);
        }

        return await BarReaction.bulkCreate(uniqueData.map((item) => ({
            barID: item.barID,
            ReactionType: item.ReactionType,
        })));
    } catch (error) {
        throw new Error(`Lỗi khi tạo nhiều BarReaction: ${error.message}`);
    }
};

const getAllBarReactions = async () => {
    try {
        return await BarReaction.findAll({
            include: [
                { model: Bar, as: 'Bar' },
                { model: AllCode, as: 'Reaction' },
            ],
        });
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách BarReaction: ${error.message}`);
    }
};

const getBarReactionById = async (id) => {
    try {
        const item = await BarReaction.findByPk(id, { include: [{ model: Bar, as: 'Bar' }, { model: AllCode, as: 'Reaction' }] });
        if (!item) throw new Error('BarReaction không tồn tại');
        return item;
    } catch (error) {
        throw new Error(`Lỗi khi lấy BarReaction: ${error.message}`);
    }
};

const getBarReactionsByBarId = async (barId) => {
    try {
        await checkBarExists(barId);
        return await BarReaction.findAll({ where: { barID: barId }, include: [{ model: AllCode, as: 'Reaction' }] });
    } catch (error) {
        throw new Error(`Lỗi khi lấy BarReaction theo barID: ${error.message}`);
    }
};

const updateBarReaction = async (id, data) => {
    try {

        const item = await BarReaction.findByPk(id);
        if (!item) throw new Error('BarReaction không tồn tại');

        if (data.barID !== undefined && data.barID !== item.barID) {
            await checkBarExists(data.barID);
        }

        if (data.ReactionType !== undefined && data.ReactionType !== item.ReactionType) {
            await checkReactionTypeExists(data.ReactionType);
        }

        await item.update({
            barID: data.barID !== undefined ? data.barID : item.barID,
            ReactionType: data.ReactionType !== undefined ? data.ReactionType : item.ReactionType,
        });

        return item;
    } catch (error) {
        throw new Error(`Lỗi khi cập nhật BarReaction: ${error.message}`);
    }
};

const deleteBarReaction = async (id) => {
    try {
        const item = await BarReaction.findByPk(id);
        if (!item) throw new Error('BarReaction không tồn tại');

        await item.destroy();
        return { message: 'Xóa BarReaction thành công' };
    } catch (error) {
        throw new Error(`Lỗi khi xóa BarReaction: ${error.message}`);
    }
};

module.exports = {
    createBarReaction,
    createBarReactions,
    keepLastReactionByBarId,
    getAllBarReactions,
    getBarReactionById,
    getBarReactionsByBarId,
    updateBarReaction,
    deleteBarReaction,
};
