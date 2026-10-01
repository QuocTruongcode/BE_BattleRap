const aiChatContextService = require('../services/aiChatContextService');
const aiChatService = require('../services/aiChatService');

const formatItemsAsMarkdown = (items) => items.map((item) => {
    if (item.role === 'user') return `Câu hỏi: ${item.content}`;
    if (item.role === 'assistant') return `Câu trả lời: ${item.content}`;
    return item.content;
}).join('\n');

const wrapChatHistory = (markdown) => `Lịch sử chat-------------------------\n${markdown}\nKết thúc lịch sử chat----------------------`;

const getLatestConversationContext = async (req, res) => {
    const userID = Number(req.user?.userId);
    if (!Number.isInteger(userID) || userID <= 0) {
        return res.status(401).json({ success: false, message: 'JWT không chứa userId hợp lệ' });
    }

    const { conversationID } = req.query || {};
    if (typeof conversationID !== 'string' || conversationID.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'conversationID không hợp lệ' });
    }

    try {
        const items = await aiChatContextService.getLatestConversationContext(conversationID, userID);
        const markdown = wrapChatHistory(formatItemsAsMarkdown(items));
        console.log("Check markdown: ", markdown)
        return res.status(200).json({ success: true, data: items, markdown });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const askWithContext = async (req, res) => {
    const userID = Number(req.user?.userId);
    if (!Number.isInteger(userID) || userID <= 0) {
        return res.status(401).json({ success: false, message: 'JWT không chứa userId hợp lệ' });
    }

    const { conversationID, question } = req.body || {};
    if (typeof conversationID !== 'string' || conversationID.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'conversationID không hợp lệ' });
    }
    if (typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'question không hợp lệ' });
    }

    try {
        const items = await aiChatContextService.getLatestConversationContext(conversationID, userID);
        const latestItem = items[items.length - 1];
        let markdown = formatItemsAsMarkdown(items);

        if (latestItem?.role !== 'user' || latestItem.content !== question.trim()) {
            markdown = [markdown, `Câu hỏi cần trả lời: ${question.trim()}`].filter(Boolean).join('\n');
        }

        markdown = wrapChatHistory(markdown);

        // console.log("Check markdown question: ", markdown)

        const aiResponse = await aiChatService.askWithContext(markdown);
        return res.status(200).json({ success: true, data: aiResponse, markdown });
    } catch (error) {
        return res.status(error.response ? 502 : 500).json({
            success: false,
            message: error.response?.data?.message || error.message,
        });
    }
};

module.exports = { getLatestConversationContext, askWithContext };