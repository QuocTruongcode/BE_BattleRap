"use strict";
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class BarReaction extends Model {
        static associate(models) {
            BarReaction.belongsTo(models.Bar, {
                foreignKey: 'barID',
                as: 'Bar'
            });

            BarReaction.belongsTo(models.AllCode, {
                foreignKey: 'ReactionType',
                targetKey: 'KeyMap',
                as: 'Reaction'
            });
        }
    }
    BarReaction.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        barID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ReactionType: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'BarReaction',
        tableName: 'BarReactions',
    });
    return BarReaction;
};
