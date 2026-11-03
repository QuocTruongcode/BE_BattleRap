'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('replyComment', 'commentID', {
            type: Sequelize.INTEGER,
            allowNull: true
        });

        await queryInterface.addColumn('replyComment', 'replyCommentID', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'replyComment',
                key: 'id'
            },
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('replyComment', 'replyCommentID');

        await queryInterface.changeColumn('replyComment', 'commentID', {
            type: Sequelize.INTEGER,
            allowNull: false
        });
    }
};
