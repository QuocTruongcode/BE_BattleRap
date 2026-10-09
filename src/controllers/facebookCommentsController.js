const { scrapeFacebookComments } = require("../services/facebookCommentsService");

const scrapeFacebookCommentsController = async (req, res) => {
    try {
        const posts = await scrapeFacebookComments(req.body?.links);
        return res.status(200).json({
            success: true,
            count: posts.length,
            data: posts,
        });
    } catch (error) {
        const status = error.statusCode || 500;
        if (status >= 500) {
            console.error("scrapeFacebookCommentsController error:", error);
        }

        return res.status(status).json({
            success: false,
            message: status === 400
                ? error.message
                : "Có lỗi xảy ra khi lấy bình luận Facebook",
        });
    }
};

module.exports = {
    scrapeFacebookCommentsController,
};
