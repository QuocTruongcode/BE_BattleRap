'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('commentVideo', 'content', {
            type: Sequelize.TEXT,
            allowNull: false
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('commentVideo', 'content');
    }
};
