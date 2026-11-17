const {
    Bar,
    BarReaction,
    Battler,
    CommentVideo,
    ReactionComment,
    ReplyComment,
    Video,
    VideoBattler,
    historyChatBot: HistoryChatBot,
} = require("../../models");

const getUserActivityHistory = async (userID) => {
    const [comments, replies, repliesReceived, chatHistory, barReactions, commentReactions] = await Promise.all([
        CommentVideo.findAll({
            where: { userID },
            order: [["createdAt", "ASC"], ["id", "ASC"]],
        }),
        ReplyComment.findAll({
            where: { userID },
            order: [["createdAt", "ASC"], ["id", "ASC"]],
        }),
        ReplyComment.findAll({
            where: { replyUserID: userID },
            order: [["createdAt", "ASC"], ["id", "ASC"]],
        }),
        HistoryChatBot.findAll({
            where: { UserID: userID },
            order: [["createdAt", "ASC"], ["id", "ASC"]],
        }),
        BarReaction.findAll({
            where: { userID },
            include: [{
                model: Bar,
                as: "Bar",
            }],
            order: [["createdAt", "ASC"], ["id", "ASC"]],
        }),
        ReactionComment.findAll({
            where: { userID },
            include: [
                {
                    model: CommentVideo,
                    as: "CommentVideo",
                },
                {
                    model: ReplyComment,
                    as: "ReplyComment",
                },
            ],
            order: [["createdAt", "ASC"], ["id", "ASC"]],
        }),
    ]);

    return {
        comments,
        replies,
        repliesReceived,
        chatHistory,
        barReactions,
        commentReactions,
    };
};

const getLatestUserActivities = async (userID) => {
    const [comments, replies, repliesReceived, barReactions, commentReactions] = await Promise.all([
        CommentVideo.findAll({
            where: { userID },
            order: [["createdAt", "DESC"], ["id", "DESC"]],
            limit: 2,
        }),
        ReplyComment.findAll({
            where: { userID },
            include: [{
                model: CommentVideo,
                as: "CommentVideo",
            }],
            order: [["createdAt", "DESC"], ["id", "DESC"]],
            limit: 2,
        }),
        ReplyComment.findAll({
            where: { replyUserID: userID },
            include: [{
                model: CommentVideo,
                as: "CommentVideo",
            }],
            order: [["createdAt", "DESC"], ["id", "DESC"]],
            limit: 2,
        }),
        BarReaction.findAll({
            where: { userID },
            include: [{
                model: Bar,
                as: "Bar",
            }],
            order: [["createdAt", "DESC"], ["id", "DESC"]],
            limit: 2,
        }),
        ReactionComment.findAll({
            where: { userID },
            include: [
                {
                    model: CommentVideo,
                    as: "CommentVideo",
                },
                {
                    model: ReplyComment,
                    as: "ReplyComment",
                    include: [{
                        model: CommentVideo,
                        as: "CommentVideo",
                    }],
                },
            ],
            order: [["createdAt", "DESC"], ["id", "DESC"]],
            limit: 2,
        }),
    ]);

    const activities = [
        ...comments.map((record) => ({ type: "comment", record })),
        ...replies.map((record) => ({ type: "reply", record })),
        ...repliesReceived.map((record) => ({ type: "replyReceived", record })),
        ...barReactions.map((record) => ({ type: "barReaction", record })),
        ...commentReactions.map((record) => ({ type: "commentReaction", record })),
    ];

    const activitiesWithVideoIds = activities.map(addVideoId);
    const videoIDs = [...new Set(
        activitiesWithVideoIds
            .map(({ videoID }) => videoID)
            .filter((videoID) => videoID !== null && videoID !== undefined)
    )];
    const videoBattlers = videoIDs.length > 0
        ? await VideoBattler.findAll({
            where: { videoID: videoIDs },
            attributes: ["videoID", "battlerID"],
            raw: true,
        })
        : [];
    const battlerIDsByVideoID = new Map();
    for (const { videoID, battlerID } of videoBattlers) {
        const key = Number(videoID);
        const battlerIDs = battlerIDsByVideoID.get(key) || [];
        battlerIDs.push(Number(battlerID));
        battlerIDsByVideoID.set(key, battlerIDs);
    }

    return activitiesWithVideoIds
        .map((activity) => ({
            ...activity,
            battlerIDs: activity.videoID === null
                ? []
                : battlerIDsByVideoID.get(Number(activity.videoID)) || [],
        }))
        .sort((a, b) => {
            const createdAtDifference =
                new Date(b.record.createdAt).getTime() - new Date(a.record.createdAt).getTime();
            return createdAtDifference || Number(b.record.id) - Number(a.record.id);
        })
        .slice(0, 2);
};

const addVideoId = (activity) => {
    const { record, type } = activity;
    const comment = type === "comment"
        ? record
        : record.CommentVideo || record.ReplyComment?.CommentVideo;
    const videoID = type === "barReaction" ? record.Bar?.videoId : comment?.videoID;

    return {
        ...activity,
        videoID: videoID == null ? null : Number(videoID),
    };
};

const buildRecommendationMarkdown = async (activities) => {
    if (!Array.isArray(activities)) {
        throw new TypeError("activities phải là một danh sách");
    }

    const videoIDs = [...new Set(
        activities
            .map(({ videoID }) => Number(videoID))
            .filter((videoID) => Number.isSafeInteger(videoID) && videoID > 0)
    )];
    const battlerIDs = [...new Set(
        activities.flatMap(({ battlerIDs: ids }) => Array.isArray(ids) ? ids : [])
            .map(Number)
            .filter((battlerID) => Number.isSafeInteger(battlerID) && battlerID > 0)
    )];
    const [videos, battlers] = await Promise.all([
        videoIDs.length > 0
            ? Video.findAll({
                where: { id: videoIDs },
                attributes: ["id", "title", "review"],
                include: [{
                    model: Battler,
                    as: "Battlers",
                    attributes: ["id", "RapName", "FullName"],
                    through: { attributes: [] },
                }],
            })
            : [],
        battlerIDs.length > 0
            ? Battler.findAll({
                where: { id: battlerIDs },
                attributes: ["id", "RapName", "FullName"],
            })
            : [],
    ]);

    const recentVideosByBattler = await Promise.all(
        battlers.map(async (battler) => {
            const videoBattlers = await VideoBattler.findAll({
                where: { battlerID: battler.id },
                attributes: [],
                include: [{
                    model: Video,
                    as: "Video",
                    attributes: ["id", "title", "review", "createdAt"],
                }],
                order: [
                    [{ model: Video, as: "Video" }, "createdAt", "DESC"],
                    [{ model: Video, as: "Video" }, "id", "DESC"],
                ],
                limit: 5,
            });

            return {
                battler,
                videos: videoBattlers.map(({ Video: video }) => video).filter(Boolean),
            };
        })
    );

    const videoByID = new Map(videos.map((video) => [Number(video.id), video]));
    const formatValue = (value) => {
        if (value === null || value === undefined || String(value).trim() === "") {
            return "Chưa có thông tin";
        }
        return String(value).trim();
    };
    const activityVideoIDs = [...new Set(videoIDs)];
    const sections = ["# Ngữ cảnh gợi ý video"];

    sections.push("", "## Video trong lịch sử hoạt động gần đây");
    if (activityVideoIDs.length === 0) {
        sections.push("- Không tìm thấy video liên quan đến hoạt động gần đây.");
    } else {
        for (const videoID of activityVideoIDs) {
            const video = videoByID.get(videoID);
            if (!video) continue;

            const videoBattlers = video.Battlers || [];
            sections.push(
                "",
                `### ${formatValue(video.title)}`,
                `- Video ID: ${videoID}`,
                `- Review: ${formatValue(video.review)}`,
                `- Battler: ${videoBattlers.length > 0
                    ? videoBattlers.map(({ RapName, FullName }) =>
                        `${formatValue(RapName)} (${formatValue(FullName)})`).join(", ")
                    : "Chưa có thông tin"}`
            );
        }
    }

    sections.push("", "## 5 video mới nhất theo từng battler");
    if (recentVideosByBattler.length === 0) {
        sections.push("- Không tìm thấy battler liên quan đến hoạt động gần đây.");
    } else {
        for (const { battler, videos: recentVideos } of recentVideosByBattler) {
            sections.push(
                "",
                `### ${formatValue(battler.RapName)} (${formatValue(battler.FullName)})`
            );
            if (recentVideos.length === 0) {
                sections.push("- Không tìm thấy video.");
                continue;
            }

            recentVideos.forEach((video, index) => {
                sections.push(
                    `${index + 1}. **${formatValue(video.title)}**`,
                    `   - Review: ${formatValue(video.review)}`
                );
            });
        }
    }

    return sections.join("\n");
};



const getLatestUserActivitiesMarkdown = async (userID) => {
    const activities = await getLatestUserActivities(userID);
    console.log("Activities for Markdown:", activities);

    return buildRecommendationMarkdown(activities);

};

module.exports = {
    getUserActivityHistory,
    getLatestUserActivities,
    buildRecommendationMarkdown,
    getLatestUserActivitiesMarkdown,
};