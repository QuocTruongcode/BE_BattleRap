const axios = require("axios");
const { Video } = require("../../models");
const { Op } = require("sequelize");
const { getAllDramaEventByDramaID } = require("./dramaEventService");

const AI_SERVER_URL = process.env.AI_SERVER_URL;

const getReviewDramaAnswer = async (dramaID) => {
    console.log("Check AI_SERVER_URL: ", AI_SERVER_URL);
    try {
        const reviews = await getReviewDrama(dramaID);
        const response = await axios.post(`${AI_SERVER_URL}/post-input-question`, {
            question: `Hãy phân tích các sự kiện drama sau và đưa ra nhận xét tổng quan:\n${JSON.stringify(reviews)}`,
        });

        return response.data;
    } catch (error) {
        console.error('Error in getReviewDramaAnswer:', error);
        throw error;
    }

};

const getReviewDrama = async (dramaID) => {
    const dramaEvents = await getAllDramaEventByDramaID(dramaID);
    const videoIDs = [...new Set(
        dramaEvents
            .map((event) => event.videoID)
            .filter((videoID) => videoID !== null && videoID !== undefined)
    )];
    const videos = videoIDs.length > 0
        ? await Video.findAll({
            attributes: ["id", "title", "linkVideo", "review"],
            where: { id: { [Op.in]: videoIDs } },
            raw: true,
        })
        : [];
    const videosByID = new Map(videos.map((video) => [video.id, video]));

    return dramaEvents
        .map((event) => {
            const dramaEvent = event.get({ plain: true });
            const reviewData = {
                id: dramaEvent.id,
                title: dramaEvent.title,
                link: dramaEvent.link,
                review: dramaEvent.review,
                time: dramaEvent.time,
                videoID: dramaEvent.videoID,
            };

            if (dramaEvent.videoID !== null && dramaEvent.videoID !== undefined) {
                const video = videosByID.get(dramaEvent.videoID);
                reviewData.VideoTitle = video?.title ?? null;
                reviewData.linkVideo = video?.linkVideo ?? null;
                reviewData.videoReview = video?.review ?? null;
            }

            return reviewData;
        })
        .sort((first, second) => first.id - second.id);
};

module.exports = {
    getReviewDramaAnswer,
    getReviewDrama,
};
