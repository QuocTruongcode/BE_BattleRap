const youtubeService = require("../services/youtubeService");

const getComments = async (req, res) => {

    try {

        const { videoId } = req.query;

        const result = await youtubeService.getComments(videoId);
        return res.json(result);

    } catch (error) {

        return res.status(500).json({
            message: error.message
        });

    }

}

module.exports = {
    getComments
}