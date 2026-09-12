'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class VideoBattler extends Model {
        static associate(models) {
            VideoBattler.belongsTo(models.Video, {
                foreignKey: 'videoID',
                as: 'Video'
            });

            VideoBattler.belongsTo(models.Battler, {
                foreignKey: 'battlerID',
                as: 'Battler'
            });
        }
    }

    VideoBattler.init({
        videoID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'Videos',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        battlerID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'Battlers',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        }
    }, {
        sequelize,
        modelName: 'VideoBattler',
        tableName: 'VideoBattlers',
        timestamps: false,
    });

    return VideoBattler;
};
