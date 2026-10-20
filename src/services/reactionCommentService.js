const { Op } = require("sequelize");
const { CommentVideo, ReactionComment, ReplyComment, User, sequelize } = require("../../models");

const createNotFoundError = (message) => {
    const error = new Error(message);
    error.statusCode = 404;
    return error;
};

const getReactionComment = async (id) => {
    const reaction = await ReactionComment.findByPk(id);
    if (!reaction) {
        throw createNotFoundError("Không tìm thấy reaction");
    }
    return reaction;
};

const getOwnedReactionComment = async (id, userID) => {
    const reaction = await ReactionComment.findOne({ where: { id, userID } });
    if (!reaction) {
        throw createNotFoundError("Không tìm thấy reaction");
    }
    return reaction;
};

const validateTarget = async ({ commentID, replyCommentID }) => {
    const hasComment = commentID !== undefined && commentID !== null;
    const hasReply = replyCommentID !== undefined && replyCommentID !== null;
    if (hasComment === hasReply) {
        const error = new Error("Phải cung cấp đúng một trong hai trường commentID hoặc replyCommentID");
        error.statusCode = 400;
        throw error;
    }

    const target = hasComment
        ? await CommentVideo.findByPk(commentID)
        : await ReplyComment.findByPk(replyCommentID);
    if (!target) {
        throw createNotFoundError(hasComment ? "Không tìm thấy bình luận" : "Không tìm thấy trả lời bình luận");
    }
};

const upsertReactionComment = async ({ userID, commentID, replyCommentID, reaction }) => {
    await validateTarget({ commentID, replyCommentID });
    const targetField = commentID != null ? "commentID" : "replyCommentID";
    const targetID = commentID ?? replyCommentID;
    const where = { userID, [targetField]: targetID };

    try {
        return await sequelize.transaction(async (transaction) => {
            const existing = await ReactionComment.findOne({ where, transaction });
            if (existing) {
                await existing.update({ reaction }, { transaction });
                return { reaction: existing, created: false };
            }

            const createdReaction = await ReactionComment.create({
                userID,
                commentID: commentID ?? null,
                replyCommentID: replyCommentID ?? null,
                reaction
            }, { transaction });
            return { reaction: createdReaction, created: true };
        });
    } catch (error) {
        if (error.name !== "SequelizeUniqueConstraintError") {
            throw error;
        }

        const existing = await ReactionComment.findOne({ where });
        if (!existing) {
            throw error;
        }
        await existing.update({ reaction });
        return { reaction: existing, created: false };
    }
};

const getReactionComments = async (targetField, targetID) => {
    const targetModel = targetField === "commentID" ? CommentVideo : ReplyComment;
    const target = await targetModel.findByPk(targetID);
    if (!target) {
        throw createNotFoundError(targetField === "commentID" ? "Không tìm thấy bình luận" : "Không tìm thấy trả lời bình luận");
    }
    return ReactionComment.findAll({
        where: { [targetField]: targetID },
        include: [{ model: User, as: "User", attributes: ["UserName"] }],
        order: [["createdAt", "ASC"], ["id", "ASC"]]
    });
};

const getReactionCommentsByComment = async (commentID) => getReactionComments("commentID", commentID);
const getReactionCommentsByReply = async (replyCommentID) => getReactionComments("replyCommentID", replyCommentID);

const getUserCommentReactions = async (userID) => {
    return ReactionComment.findAll({
        attributes: ["commentID", "reaction"],
        where: {
            userID,
            commentID: { [Op.not]: null }
        },
        order: [["commentID", "ASC"]],
        raw: true
    });
};

const getReactionCommentById = async (id) => getReactionComment(id);

const updateReactionComment = async (id, userID, reaction) => {
    const item = await getOwnedReactionComment(id, userID);
    await item.update({ reaction });
    return item;
};

const deleteReactionComment = async (id, userID) => {
    const item = await getOwnedReactionComment(id, userID);
    await item.destroy();
};

module.exports = {
    upsertReactionComment,
    getReactionCommentsByComment,
    getReactionCommentsByReply,
    getUserCommentReactions,
    getReactionCommentById,
    updateReactionComment,
    deleteReactionComment
};
