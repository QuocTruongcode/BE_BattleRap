'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('Bars');

        if (!table.averageScore) {
            await queryInterface.addColumn('Bars', 'averageScore', {
                type: Sequelize.FLOAT,
                allowNull: true
            });
        }
    },

    async down(queryInterface) {
        const table = await queryInterface.describeTable('Bars');

        if (table.averageScore) {
            await queryInterface.removeColumn('Bars', 'averageScore');
        }
    }
};
