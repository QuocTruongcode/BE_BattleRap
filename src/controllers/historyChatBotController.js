const historyChatBotService = require('../services/historyChatBotService');

const validateUserId = (req, res) => {
    const userID = Number(req.user?.userId);
    if (!Number.isInteger(userID) || userID <= 0) {
        res.status(401).json({ success: false, message: 'JWT không chứa userId hợp lệ' });
        return null;
    }
    return userID;
};

const validateId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const handleError = (res, error) => {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
};

const createHistoryChatBot = async (req, res) => {
    const userID = validateUserId(req, res);
    if (!userID) return;

    const { conversationID, role, content } = req.body || {};
    if (![conversationID, role, content].every(isNonEmptyString)) {
        return res.status(400).json({
            success: false,
            message: 'conversationID, role và content phải là chuỗi không được để trống',
        });
    }

    try {
        const item = await historyChatBotService.createHistoryChatBot({
            conversationID,
            role,
            content,
            userID,
        });
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        handleError(res, error);
    }
};

const getHistoryChatBotsByConversation = async (req, res) => {
    const userID = validateUserId(req, res);
    if (!userID) return;

    const { conversationID } = req.params;
    if (!isNonEmptyString(conversationID)) {
        return res.status(400).json({ success: false, message: 'conversationID không hợp lệ' });
    }

    try {
        const items = await historyChatBotService.getHistoryChatBotsByConversation(conversationID, userID);
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        handleError(res, error);
    }
};

const getRecentConversationIDs = async (req, res) => {
    const userID = validateUserId(req, res);
    if (!userID) return;

    try {
        const conversationIDs = await historyChatBotService.getRecentConversationIDs(userID);
        res.status(200).json({ success: true, data: conversationIDs });
    } catch (error) {
        handleError(res, error);
    }
};

const getHistoryChatBotById = async (req, res) => {
    const userID = validateUserId(req, res);
    if (!userID) return;
    if (!validateId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'id phải là số nguyên dương hợp lệ' });
    }

    try {
        const item = await historyChatBotService.getHistoryChatBotById(Number(req.params.id), userID);
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        handleError(res, error);
    }
};

const updateHistoryChatBot = async (req, res) => {
    const userID = validateUserId(req, res);
    if (!userID) return;
    if (!validateId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'id phải là số nguyên dương hợp lệ' });
    }

    const body = req.body || {};
    const allowedFields = ['conversationID', 'role', 'content'];
    const fields = Object.keys(body);
    if (fields.length === 0 || fields.some((field) => !allowedFields.includes(field))) {
        return res.status(400).json({
            success: false,
            message: 'Chỉ được cập nhật conversationID, role hoặc content',
        });
    }
    if (fields.some((field) => !isNonEmptyString(body[field]))) {
        return res.status(400).json({ success: false, message: 'Các trường cập nhật phải là chuỗi không được để trống' });
    }

    try {
        const item = await historyChatBotService.updateHistoryChatBot(Number(req.params.id), userID, body);
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        handleError(res, error);
    }
};

const deleteHistoryChatBot = async (req, res) => {
    const userID = validateUserId(req, res);
    if (!userID) return;
    if (!validateId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'id phải là số nguyên dương hợp lệ' });
    }

    try {
        await historyChatBotService.deleteHistoryChatBot(Number(req.params.id), userID);
        res.status(200).json({ success: true, message: 'Đã xóa lịch sử hội thoại' });
    } catch (error) {
        handleError(res, error);
    }
};

module.exports = {
    createHistoryChatBot,
    getHistoryChatBotsByConversation,
    getRecentConversationIDs,
    getHistoryChatBotById,
    updateHistoryChatBot,
    deleteHistoryChatBot,
};