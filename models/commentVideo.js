'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CommentVideo extends Model {
        static associate(models) {
            CommentVideo.hasMany(models.ReplyComment, {
                foreignKey: 'commentID',
                sourceKey: 'id',
                as: 'ReplyComments'
            });

            CommentVideo.hasMany(models.ReactionComment, {
                foreignKey: 'commentID',
                sourceKey: 'id',
                as: 'ReactionComments'
            });

            CommentVideo.belongsTo(models.User, {
                foreignKey: 'userID',
                targetKey: 'id',
                as: 'User'
            });

            CommentVideo.belongsTo(models.Video, {
                foreignKey: 'videoID',
                targetKey: 'id',
                onDelete: 'NO ACTION',
                as: 'Video'
            });

            CommentVideo.belongsTo(models.Bar, {
                foreignKey: 'barID',
                targetKey: 'id',
                as: 'Bar'
            });
        }
    }

    CommentVideo.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        videoID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        barID: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'CommentVideo',
        tableName: 'commentVideo'
    });

    return CommentVideo;
};
