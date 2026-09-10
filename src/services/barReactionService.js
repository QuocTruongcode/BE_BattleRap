const { BarReaction, Bar, AllCode, User } = require("../../models");
const { Op } = require("sequelize");

const checkBarExists = async (barId) => {
    const bar = await Bar.findByPk(barId);
    if (!bar) throw new Error(`Bar với ID ${barId} không tồn tại`);
};

const checkReactionTypeExists = async (reactionType) => {
    if (!reactionType) return;
    const rec = await AllCode.findOne({ where: { KeyMap: reactionType, Type: "BarReaction" } });
    if (!rec) throw new Error(`ReactionType với KeyMap ${reactionType} không tồn tại`);
};

const checkUserExists = async (userId) => {
    if (userId === undefined || userId === null) {
        throw new Error("userID là bắt buộc");
    }
    const user = await User.findByPk(userId);
    if (!user) throw new Error(`User với ID ${userId} không tồn tại`);
};

const checkBarUserPairUnique = async (data) => {
    const pairs = new Map();

    for (const [index, item] of data.entries()) {
        const key = `${item.barID}-${item.userID}`;
        const previousIndex = pairs.get(key);

        if (previousIndex !== undefined) {
            throw new Error(
                `Cặp barID ${item.barID} và userID ${item.userID} bị trùng ` +
                `ở vị trí ${previousIndex} và ${index}`
            );
        }

        pairs.set(key, index);
    }

    const existingReactions = data.length === 0
        ? []
        : await BarReaction.findAll({
            where: {
                [Op.or]: data.map((item) => ({
                    barID: item.barID,
                    userID: item.userID,
                })),
            },
            attributes: ['id', 'barID', 'userID'],
        });

    const existingPairs = new Set(
        existingReactions.map((item) => `${item.barID}-${item.userID}`)
    );

    return {
        itemsToUpdate: data.filter((item) => existingPairs.has(`${item.barID}-${item.userID}`)),
        itemsToCreate: data.filter((item) => !existingPairs.has(`${item.barID}-${item.userID}`)),
    };
};

const createBarReaction = async (data) => {
    try {
        if (!data.barID) throw new Error("barID là bắt buộc");
        if (!data.ReactionType) throw new Error("ReactionType là bắt buộc");

        await checkBarExists(data.barID);
        await checkReactionTypeExists(data.ReactionType);
        await checkUserExists(data.userID);
        const { itemsToUpdate } = await checkBarUserPairUnique([data]);
        if (itemsToUpdate.length > 0) {
            throw new Error(`Cặp barID ${data.barID} và userID ${data.userID} đã tồn tại`);
        }

        const item = await BarReaction.create({
            barID: data.barID,
            userID: data.userID,
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

        for (const [index, item] of data.entries()) {
            if (!item || !item.barID) {
                throw new Error(`BarReaction tại vị trí ${index} thiếu barID`);
            }
            if (item.userID === undefined || item.userID === null) {
                throw new Error(`BarReaction tại vị trí ${index} thiếu userID`);
            }
            if (!item.ReactionType) {
                throw new Error(`BarReaction tại vị trí ${index} thiếu ReactionType`);
            }

            await checkBarExists(item.barID);
            await checkUserExists(item.userID);
            await checkReactionTypeExists(item.ReactionType);
        }

        const { itemsToUpdate, itemsToCreate } = await checkBarUserPairUnique(data);
        const updatedItems = await updateBarReactions(itemsToUpdate);
        const createdItems = itemsToCreate.length > 0
            ? await BarReaction.bulkCreate(itemsToCreate.map((item) => ({
                barID: item.barID,
                userID: item.userID,
                ReactionType: item.ReactionType,
            })))
            : [];

        return [...updatedItems, ...createdItems];
    } catch (error) {
        throw new Error(`Lỗi khi tạo nhiều BarReaction: ${error.message}`);
    }
};

const updateBarReactions = async (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const existingReactions = await BarReaction.findAll({
        where: {
            [Op.or]: data.map((item) => ({
                barID: item.barID,
                userID: item.userID,
            })),
        },
    });

    const existingByPair = new Map(
        existingReactions.map((item) => [`${item.barID}-${item.userID}`, item])
    );

    return Promise.all(data.map(async (item) => {
        const existingItem = existingByPair.get(`${item.barID}-${item.userID}`);
        if (!existingItem) {
            throw new Error(`Không tìm thấy BarReaction với cặp barID ${item.barID} và userID ${item.userID}`);
        }

        await existingItem.update({ ReactionType: item.ReactionType });
        return existingItem;
    }));
};

const getAllBarReactions = async () => {
    try {
        return await BarReaction.findAll({
            include: [
                { model: Bar, as: 'Bar' },
                { model: AllCode, as: 'Reaction' },
                { model: User, as: 'User' },
            ],
        });
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách BarReaction: ${error.message}`);
    }
};

const getBarReactionById = async (id) => {
    try {
        const item = await BarReaction.findByPk(id, { include: [{ model: Bar, as: 'Bar' }, { model: AllCode, as: 'Reaction' }, { model: User, as: 'User' }] });
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

const getBarReactionsByUserAndVideo = async (userId, videoId) => {
    try {
        return await BarReaction.findAll({
            where: { userID: userId },
            include: [
                {
                    model: Bar,
                    as: 'Bar',
                    required: true,
                    where: { videoId },
                    attributes: [],
                },
                // { model: AllCode, as: 'Reaction' },
                // { model: User, as: 'User' },

            ],
        });
    } catch (error) {
        throw new Error(`Lỗi khi lấy BarReaction theo userID và videoID: ${error.message}`);
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
    checkBarUserPairUnique,
    updateBarReactions,
    getAllBarReactions,
    getBarReactionById,
    getBarReactionsByBarId,
    getBarReactionsByUserAndVideo,
    updateBarReaction,
    deleteBarReaction,
};
