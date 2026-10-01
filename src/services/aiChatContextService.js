const { historyChatBot: HistoryChatBot } = require('../../models');

const getLatestConversationContext = async (conversationID, userID) => {
    const items = await HistoryChatBot.findAll({
        where: { conversationID, UserID: userID },
        order: [['id', 'DESC']],
        limit: 6,
    });

    return items.reverse();
};

module.exports = { getLatestConversationContext };