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
