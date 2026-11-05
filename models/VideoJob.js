'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class VideoJob extends Model {
        static associate(models) {
            VideoJob.belongsTo(models.Video, {
                foreignKey: 'videoID',
                as: 'Video'
            });
        }
    }

    VideoJob.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },

        videoID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Videos',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },

        fileName: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'PENDING'
        },

        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        workerID: {
            type: DataTypes.STRING(100),
            allowNull: true
        }

    }, {
        sequelize,
        modelName: 'VideoJob',
        tableName: 'VideoJobs',
        timestamps: true,
    });

    return VideoJob;
};