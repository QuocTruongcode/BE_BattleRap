'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('commentVideo', 'like', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        });

        await queryInterface.addColumn('commentVideo', 'dissLike', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        });

        await queryInterface.createTable('replyComment', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            commentID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'commentVideo',
                    key: 'id'
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            userID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE'
            },
            replyUserID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE'
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            like: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            dissLike: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
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
        await queryInterface.dropTable('replyComment');
        await queryInterface.removeColumn('commentVideo', 'dissLike');
        await queryInterface.removeColumn('commentVideo', 'like');
    }
};
