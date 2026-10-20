'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const columns = await queryInterface.describeTable('commentVideo');
        if (columns.like) {
            await queryInterface.removeColumn('commentVideo', 'like');
        }
        if (columns.dissLike) {
            await queryInterface.removeColumn('commentVideo', 'dissLike');
        }
    },

    async down(queryInterface, Sequelize) {
        const columns = await queryInterface.describeTable('commentVideo');
        if (!columns.like) {
            await queryInterface.addColumn('commentVideo', 'like', {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            });
        }
        if (!columns.dissLike) {
            await queryInterface.addColumn('commentVideo', 'dissLike', {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            });
        }
    }
};
