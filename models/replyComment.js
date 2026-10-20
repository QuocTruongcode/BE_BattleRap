'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ReplyComment extends Model {
        static associate(models) {
            ReplyComment.belongsTo(models.CommentVideo, {
                foreignKey: 'commentID',
                targetKey: 'id',
                as: 'CommentVideo'
            });

            ReplyComment.belongsTo(models.User, {
                foreignKey: 'userID',
                targetKey: 'id',
                as: 'User'
            });

            ReplyComment.belongsTo(models.User, {
                foreignKey: 'replyUserID',
                targetKey: 'id',
                as: 'ReplyUser'
            });

            ReplyComment.hasMany(models.ReactionComment, {
                foreignKey: 'replyCommentID',
                sourceKey: 'id',
                as: 'ReactionComments'
            });
        }
    }

    ReplyComment.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        commentID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        replyUserID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'ReplyComment',
        tableName: 'replyComment'
    });

    return ReplyComment;
};
