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

const createReplyComment = async ({ commentID, userID, replyUserID, content }) => {
    const [comment, replyUser] = await Promise.all([
        CommentVideo.findByPk(commentID),
        User.findByPk(replyUserID)
    ]);
    if (!comment) {
        throw createNotFoundError("Không tìm thấy bình luận");
    }
    if (!replyUser) {
        throw createNotFoundError("Không tìm thấy người được trả lời");
    }
    return ReplyComment.create({ commentID, userID, replyUserID, content });
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

const getReplyCommentById = async (id) => getReplyComment(id);

const updateReplyComment = async (id, userID, content) => {
    const reply = await getOwnedReplyComment(id, userID);
    await reply.update({ content });
    return reply;
};

const deleteReplyComment = async (id, userID) => {
    await sequelize.transaction(async (transaction) => {
        const reply = await getOwnedReplyComment(id, userID);
        await ReactionComment.destroy({
            where: { replyCommentID: id },
            transaction
        });
        await reply.destroy({ transaction });
    });
};

module.exports = {
    createReplyComment,
    getReplyCommentsByComment,
    getReplyCommentById,
    updateReplyComment,
    deleteReplyComment
};
