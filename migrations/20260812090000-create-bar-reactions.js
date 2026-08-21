'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('BarReactions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            barID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Bars',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            ReactionType: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: 'AllCodes',
                    key: 'KeyMap'
                },
                onDelete: 'CASCADE',
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

        await queryInterface.addConstraint('BarReactions', {
            fields: ['barID', 'ReactionType'],
            type: 'unique',
            name: 'barreaction_unique_bar_reaction'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('BarReactions');
    }
};
