'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class HistoryChatBot extends Model {
        static associate(models) {
            HistoryChatBot.belongsTo(models.User, {
                foreignKey: 'UserID',
                targetKey: 'id',
                as: 'User'
            });
        }
    }

    HistoryChatBot.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        conversationID: {
            type: DataTypes.STRING,
            allowNull: false
        },
        UserID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'historyChatBot',
        tableName: 'historyChatBots'
    });

    return HistoryChatBot;
};