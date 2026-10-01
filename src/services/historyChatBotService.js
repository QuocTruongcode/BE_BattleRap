const { historyChatBot: HistoryChatBot } = require('../../models');
const { fn, col } = require('sequelize');

const createHistoryChatBot = async ({ conversationID, userID, role, content }) => {
    return HistoryChatBot.create({ conversationID, UserID: userID, role, content });
};

const getHistoryChatBotsByConversation = async (conversationID, userID) => {
    const items = await HistoryChatBot.findAll({
        where: { conversationID, UserID: userID },
        order: [['createdAt', 'ASC'], ['id', 'ASC']],
    });

    if (items.length === 0) {
        const error = new Error('Không tìm thấy lịch sử hội thoại');
        error.statusCode = 404;
        throw error;
    }

    return items;
};

const getRecentConversationIDs = async (userID) => {
    const conversations = await HistoryChatBot.findAll({
        attributes: ['conversationID', [fn('MAX', col('id')), 'latestId']],
        where: { UserID: userID },
        group: ['conversationID'],
        order: [[fn('MAX', col('id')), 'DESC']],
        limit: 10,
        raw: true,
    });

    return conversations.map(({ conversationID }) => conversationID);
};

const getHistoryChatBotById = async (id, userID) => {
    const item = await HistoryChatBot.findOne({ where: { id, UserID: userID } });
    if (!item) {
        const error = new Error('Không tìm thấy lịch sử hội thoại');
        error.statusCode = 404;
        throw error;
    }
    return item;
};

const updateHistoryChatBot = async (id, userID, changes) => {
    const item = await getHistoryChatBotById(id, userID);
    await item.update(changes);
    return item;
};

const deleteHistoryChatBot = async (id, userID) => {
    const item = await getHistoryChatBotById(id, userID);
    await item.destroy();
};

module.exports = {
    createHistoryChatBot,
    getHistoryChatBotsByConversation,
    getRecentConversationIDs,
    getHistoryChatBotById,
    updateHistoryChatBot,
    deleteHistoryChatBot,
};