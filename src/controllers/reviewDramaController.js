const reviewDramaService = require("../services/reviewDramaService");

const getReviewDramaController = async (req, res) => {
    const { dramaID } = req.params;
    if (!/^\d+$/.test(dramaID) || Number(dramaID) <= 0) {
        return res.status(400).json({
            success: false,
            message: "dramaID phải là một số nguyên dương hợp lệ",
        });
    }

    try {
        const reviews = await reviewDramaService.getReviewDramaAnswer(Number(dramaID));

        return res.status(200).json({
            success: true,
            data: reviews,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getReviewDramaController,
};
