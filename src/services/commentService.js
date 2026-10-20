const { Bar, CommentVideo, ReactionComment, ReplyComment, User, Video, Sequelize } = require("../../models");

const createNotFoundError = (message) => {
    const error = new Error(message);
    error.statusCode = 404;
    return error;
};

const validateVideoAndBar = async (videoID, barID) => {
    const video = await Video.findByPk(videoID);
    if (!video) {
        throw createNotFoundError("Không tìm thấy video");
    }

    if (barID !== null && barID !== undefined) {
        const bar = await Bar.findByPk(barID);
        if (!bar) {
            throw createNotFoundError("Không tìm thấy bar");
        }
        if (Number(bar.videoId) !== videoID) {
            const error = new Error("barID không thuộc video đã chọn");
            error.statusCode = 400;
            throw error;
        }
    }
};

const getCommentOwnedByUser = async (id, userID) => {
    const comment = await CommentVideo.findOne({ where: { id, userID } });
    if (!comment) {
        throw createNotFoundError("Không tìm thấy bình luận");
    }
    return comment;
};

const createComment = async ({ videoID, userID, barID, content }) => {
    await validateVideoAndBar(videoID, barID);
    return CommentVideo.create({ videoID, userID, barID, content });
};

const getCommentsByVideo = async (videoID) => {
    const comments = await CommentVideo.findAll({
        where: { videoID },
        include: [{
            model: User,
            as: "User",
            attributes: ["UserName"]
        }],
        order: [["createdAt", "ASC"], ["id", "ASC"]]
    });

    if (comments.length === 0) {
        return comments;
    }

    const reactions = await ReactionComment.findAll({
        attributes: [
            "commentID",
            [Sequelize.fn("SUM", Sequelize.literal("CASE WHEN [reaction] = 0 THEN 1 ELSE 0 END")), "totalLike"],
            [Sequelize.fn("SUM", Sequelize.literal("CASE WHEN [reaction] = 1 THEN 1 ELSE 0 END")), "totalDissLike"]
        ],
        where: {
            commentID: comments.map((comment) => comment.id),
            reaction: [0, 1]
        },
        group: ["commentID"],
        raw: true
    });
    const replies = await ReplyComment.findAll({
        attributes: [
            "commentID",
            [Sequelize.fn("COUNT", Sequelize.col("id")), "totalReply"]
        ],
        where: {
            commentID: comments.map((comment) => comment.id)
        },
        group: ["commentID"],
        raw: true
    });
    const reactionCounts = new Map(
        reactions.map((item) => [
            Number(item.commentID),
            {
                totalLike: Number(item.totalLike),
                totalDissLike: Number(item.totalDissLike)
            }
        ])
    );
    const replyCounts = new Map(
        replies.map((item) => [Number(item.commentID), Number(item.totalReply)])
    );

    return comments.map((comment) => {
        const counts = reactionCounts.get(Number(comment.id)) || { totalLike: 0, totalDissLike: 0 };
        comment.setDataValue("totalLike", counts.totalLike);
        comment.setDataValue("totalDissLike", counts.totalDissLike);
        comment.setDataValue("totalReply", replyCounts.get(Number(comment.id)) || 0);
        return comment;
    });
};

const getCommentById = async (id) => {
    const comment = await CommentVideo.findByPk(id);
    if (!comment) {
        throw createNotFoundError("Không tìm thấy bình luận");
    }
    return comment;
};

const updateComment = async (id, userID, changes) => {
    const comment = await getCommentOwnedByUser(id, userID);
    if (Object.hasOwn(changes, "barID")) {
        await validateVideoAndBar(comment.videoID, changes.barID);
    }
    await comment.update(changes);
    return comment;
};

const deleteComment = async (id, userID) => {
    const comment = await getCommentOwnedByUser(id, userID);
    await comment.destroy();
};

module.exports = {
    createComment,
    getCommentsByVideo,
    getCommentById,
    updateComment,
    deleteComment
};
