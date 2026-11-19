const AIRecomentService = require("../services/AIRecoment");
const axios = require("axios");

const getUserActivityHistory = async (req, res) => {
    const userID = Number(req.user?.userId);
    if (!Number.isSafeInteger(userID) || userID <= 0) {
        return res.status(401).json({
            success: false,
            message: "JWT không chứa userId hợp lệ",
        });
    }

    try {
        const history = await AIRecomentService.getUserActivityHistory(userID);
        return res.status(200).json({ success: true, data: history });
    } catch (error) {
        console.error("getUserActivityHistory error:", error);
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi khi lấy lịch sử hoạt động",
        });
    }
};

const getLatestUserActivities = async (req, res) => {
    const userID = Number(req.user?.userId);
    if (!Number.isSafeInteger(userID) || userID <= 0) {
        return res.status(401).json({
            success: false,
            message: "JWT không chứa userId hợp lệ",
        });
    }

    try {
        const activities = await AIRecomentService.getLatestUserActivities(userID);
        return res.status(200).json({ success: true, data: activities });
    } catch (error) {
        console.error("getLatestUserActivities error:", error);
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi khi lấy hoạt động mới nhất",
        });
    }
};

const AI_SERVER_URL = process.env.AI_SERVER_URL;
const getLatestUserActivitiesMarkdown = async (req, res) => {
    const userID = Number(req.user?.userId);
    if (!Number.isSafeInteger(userID) || userID <= 0) {
        return res.status(401).json({
            success: false,
            message: "JWT không chứa userId hợp lệ",
        });
    }

    try {
        const markdown = await AIRecomentService.getLatestUserActivitiesMarkdown(userID);
        const analysisResponse = await axios.post(
            `${AI_SERVER_URL}/api/suggest-match`,
            { question: markdown }
        );
        console.log("Analysis Response:", analysisResponse.data);
        return res.status(200).json({ success: true, data: analysisResponse.data });
    } catch (error) {
        console.error("getLatestUserActivitiesMarkdown error:", error);
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi khi tạo ngữ cảnh gợi ý video",
        });
    }
};

module.exports = {
    getUserActivityHistory,
    getLatestUserActivities,
    getLatestUserActivitiesMarkdown,
};
