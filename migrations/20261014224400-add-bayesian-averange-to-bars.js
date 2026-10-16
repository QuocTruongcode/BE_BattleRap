'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('Bars');

        if (!table.bayesianAverange) {
            await queryInterface.addColumn('Bars', 'bayesianAverange', {
                type: Sequelize.FLOAT,
                allowNull: true
            });
        }
    },

    async down(queryInterface) {
        const table = await queryInterface.describeTable('Bars');

        if (table.bayesianAverange) {
            await queryInterface.removeColumn('Bars', 'bayesianAverange');
        }
    }
};
