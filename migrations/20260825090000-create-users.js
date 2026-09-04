'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            UserName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            Email: {
                type: Sequelize.STRING,
                allowNull: false
            },
            UserType: {
                type: Sequelize.STRING,
                allowNull: true,
                references: {
                    model: 'AllCodes',
                    key: 'KeyMap'
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('Users');
    }
};
