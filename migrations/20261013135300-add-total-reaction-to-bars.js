'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('Bars');

        if (!table.totalReaction) {
            await queryInterface.addColumn('Bars', 'totalReaction', {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            });
        }
    },

    async down(queryInterface) {
        const table = await queryInterface.describeTable('Bars');

        if (table.totalReaction) {
            await queryInterface.removeColumn('Bars', 'totalReaction');
        }
    }
};
