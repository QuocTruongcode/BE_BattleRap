const axios = require("axios");
const { searchInternetContextService } = require("../services/tavilyService");

const AI_SERVER_URL = process.env.AI_SERVER_URL;

const analysisBarController = async (req, res) => {
    try {
        // Bước 1: Gọi AI server để phân tích bar, lấy explanation + keywords
        const analysisResponse = await axios.post(
            `${AI_SERVER_URL}/analysis-bar`,
            { question: req.body.message }
        );

        const { explanation, keywords } = analysisResponse.data.message;

        // Bước 2: Gọi TRỰC TIẾP tavilyService song song cho từng keyword
        const searchResponses = await Promise.allSettled(
            keywords.map((keyword) => searchInternetContextService(keyword))
        );

        // Gộp kết quả, giữ lại keyword tương ứng với từng kết quả search
        const searchResults = searchResponses.map((result, index) => ({
            keyword: keywords[index],
            success: result.status === "fulfilled",
            data: result.status === "fulfilled" ? result.value : null,
            error: result.status === "rejected" ? result.reason.message : null,
        }));

        res.status(200).json({
            success: true,
            message: {
                explanation,
                keywords,
                searchResults,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    analysisBarController,
};