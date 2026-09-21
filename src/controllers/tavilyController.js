const tavilyService = require("../services/tavilyService");

const searchInternetContextController = async (req, res) => {
    try {
        const { message } = req.body;

        // Check tồn tại và hợp lệ
        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                errCode: 1,
                errMessage: "Missing or invalid input data: 'message' is required",
            });
        }

        const result = await tavilyService.searchInternetContextService(message);

        return res.status(200).json({
            errCode: 0,
            errMessage: "Search context successfully!",
            data: result,
        });
    } catch (error) {
        console.error("searchInternetContextController error:", error);

        return res.status(500).json({
            errCode: -1,
            errMessage: "Error from service",
        });
    }
};

module.exports = {
    searchInternetContextController,
};