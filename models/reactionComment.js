'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ReactionComment extends Model {
        static associate(models) {
            ReactionComment.belongsTo(models.User, {
                foreignKey: 'userID',
                targetKey: 'id',
                as: 'User'
            });

            ReactionComment.belongsTo(models.CommentVideo, {
                foreignKey: 'commentID',
                targetKey: 'id',
                as: 'CommentVideo'
            });

            ReactionComment.belongsTo(models.ReplyComment, {
                foreignKey: 'replyCommentID',
                targetKey: 'id',
                as: 'ReplyComment'
            });
        }
    }

    ReactionComment.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        userID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        commentID: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        replyCommentID: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        reaction: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                isValidReaction(value) {
                    if (value !== null && ![0, 1].includes(value)) {
                        throw new Error('reaction chỉ được là 0, 1 hoặc null');
                    }
                }
            }
        }
    }, {
        sequelize,
        modelName: 'ReactionComment',
        tableName: 'reactionComment',
        indexes: [{
            unique: true,
            name: 'reactioncomment_user_comment_unique',
            fields: ['userID', 'commentID'],
            where: {
                commentID: { [Op.not]: null }
            }
        }, {
            unique: true,
            name: 'reactioncomment_user_reply_unique',
            fields: ['userID', 'replyCommentID'],
            where: {
                replyCommentID: { [Op.not]: null }
            }
        }],
        validate: {
            exactlyOneCommentTarget() {
                if ((this.commentID == null) === (this.replyCommentID == null)) {
                    throw new Error('Reaction phải thuộc commentVideo hoặc replyComment');
                }
            }
        }
    });

    return ReactionComment;
};
