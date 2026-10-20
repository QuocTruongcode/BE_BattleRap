'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.belongsTo(models.AllCode, {
                foreignKey: 'UserType',
                targetKey: 'KeyMap',
                as: 'Type'
            });

            User.hasMany(models.BarReaction, {
                foreignKey: 'userID',
                sourceKey: 'id',
                as: 'BarReactions'
            });

            User.hasMany(models.historyChatBot, {
                foreignKey: 'UserID',
                sourceKey: 'id',
                as: 'historyChatBots'
            });

            User.hasMany(models.CommentVideo, {
                foreignKey: 'userID',
                sourceKey: 'id',
                as: 'CommentVideos'
            });

            User.hasMany(models.ReplyComment, {
                foreignKey: 'userID',
                sourceKey: 'id',
                as: 'ReplyComments'
            });

            User.hasMany(models.ReplyComment, {
                foreignKey: 'replyUserID',
                sourceKey: 'id',
                as: 'ReceivedReplies'
            });

            User.hasMany(models.ReactionComment, {
                foreignKey: 'userID',
                sourceKey: 'id',
                as: 'ReactionComments'
            });
        }
    }

    User.init({
        UserName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        google_sub: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        UserType: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'Users'
    });

    return User;
};
