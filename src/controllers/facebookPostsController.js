const { scrapeFacebookPosts } = require("../services/facebookPostsService");

const scrapeFacebookPostsController = async (req, res) => {
    try {
        const {
            links,
            onlyPostsNewerThan,
            onlyPostsOlderThan,
        } = req.body || {};

        const posts = await scrapeFacebookPosts({
            links,
            onlyPostsNewerThan,
            onlyPostsOlderThan,
        });

        return res.status(200).json({
            success: true,
            count: posts.length,
            data: posts,
        });
    } catch (error) {
        const status = error.statusCode || 500;
        if (status >= 500) {
            console.error("scrapeFacebookPostsController error:", error);
        }

        return res.status(status).json({
            success: false,
            message: status === 400
                ? error.message
                : "Có lỗi xảy ra khi lấy bài viết Facebook",
        });
    }
};

module.exports = {
    scrapeFacebookPostsController,
};
