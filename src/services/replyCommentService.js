const { CommentVideo, ReactionComment, ReplyComment, User, sequelize } = require("../../models");

const createNotFoundError = (message) => {
    const error = new Error(message);
    error.statusCode = 404;
    return error;
};

const getReplyComment = async (id) => {
    const reply = await ReplyComment.findByPk(id);
    if (!reply) {
        throw createNotFoundError("Không tìm thấy trả lời bình luận");
    }
    return reply;
};

const getOwnedReplyComment = async (id, userID) => {
    const reply = await ReplyComment.findOne({ where: { id, userID } });
    if (!reply) {
        throw createNotFoundError("Không tìm thấy trả lời bình luận");
    }
    return reply;
};

const createReplyComment = async ({ commentID, replyCommentID, userID, replyUserID, content }) => {
    const hasComment = commentID !== undefined && commentID !== null;
    const hasParentReply = replyCommentID !== undefined && replyCommentID !== null;


    const [target, replyUser] = await Promise.all([
        hasComment ? CommentVideo.findByPk(commentID) : ReplyComment.findByPk(replyCommentID),
        User.findByPk(replyUserID)
    ]);
    if (!target) {
        throw createNotFoundError(hasComment ? "Không tìm thấy bình luận" : "Không tìm thấy trả lời bình luận");
    }
    const rootCommentID = hasComment ? commentID : target.commentID;
    if (rootCommentID == null) {
        const error = new Error("Trả lời cha chưa được liên kết với bình luận");
        error.statusCode = 409;
        throw error;
    }
    if (!replyUser) {
        throw createNotFoundError("Không tìm thấy người được trả lời");
    }
    return ReplyComment.create({
        commentID: rootCommentID,
        replyCommentID: hasParentReply ? replyCommentID : null,
        userID,
        replyUserID,
        content
    });
};

const getReplyCommentsByComment = async (commentID) => {
    const comment = await CommentVideo.findByPk(commentID);
    if (!comment) {
        throw createNotFoundError("Không tìm thấy bình luận");
    }
    return ReplyComment.findAll({
        where: { commentID },
        include: [
            { model: User, as: "User", attributes: ["UserName"] },
            { model: User, as: "ReplyUser", attributes: ["UserName"] }
        ],
        order: [["createdAt", "ASC"], ["id", "ASC"]]
    });
};

const getReplyCommentsByReply = async (replyCommentID) => {
    const parentReply = await ReplyComment.findByPk(replyCommentID);
    if (!parentReply) {
        throw createNotFoundError("Không tìm thấy trả lời bình luận");
    }
    return ReplyComment.findAll({
        where: { replyCommentID },
        include: [
            { model: User, as: "User", attributes: ["UserName"] },
            { model: User, as: "ReplyUser", attributes: ["UserName"] }
        ],
        order: [["createdAt", "ASC"], ["id", "ASC"]]
    });
};

const getReplyCommentById = async (id) => getReplyComment(id);

const updateReplyComment = async (id, userID, content) => {
    const reply = await getOwnedReplyComment(id, userID);
    await reply.update({ content });
    return reply;
};

const getReplyCommentLevels = async (rootIds, transaction) => {
    const levels = [];
    const visited = new Set();
    let currentLevel = rootIds;

    while (currentLevel.length > 0) {
        const unseenIds = currentLevel.filter((id) => !visited.has(id));
        if (unseenIds.length === 0) {
            break;
        }
        unseenIds.forEach((id) => visited.add(id));
        levels.push(unseenIds);
        const children = await ReplyComment.findAll({
            attributes: ["id"],
            where: { replyCommentID: unseenIds },
            transaction,
            raw: true
        });
        currentLevel = children.map((child) => child.id);
    }

    return levels;
};

const deleteReplyCommentTree = async (rootIds, transaction) => {
    const levels = await getReplyCommentLevels(rootIds, transaction);
    const allIds = levels.flat();
    if (allIds.length === 0) {
        return;
    }

    await ReactionComment.destroy({
        where: { replyCommentID: allIds },
        transaction
    });

    for (const level of levels.reverse()) {
        await ReplyComment.destroy({
            where: { id: level },
            transaction
        });
    }
};

const deleteReplyCommentsByComment = async (commentID, transaction) => {
    const rootReplies = await ReplyComment.findAll({
        attributes: ["id"],
        where: { commentID, replyCommentID: null },
        transaction,
        raw: true
    });
    await deleteReplyCommentTree(rootReplies.map((reply) => reply.id), transaction);
};

const deleteReplyComment = async (id, userID) => {
    await sequelize.transaction(async (transaction) => {
        await getOwnedReplyComment(id, userID);
        await deleteReplyCommentTree([id], transaction);
    });
};

module.exports = {
    createReplyComment,
    getReplyCommentsByComment,
    getReplyCommentsByReply,
    getReplyCommentById,
    updateReplyComment,
    deleteReplyComment,
    deleteReplyCommentsByComment
};
