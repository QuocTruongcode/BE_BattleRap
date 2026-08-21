'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('Videos');

        if (!tableInfo.linkBunny) {
            await queryInterface.addColumn('Videos', 'linkBunny', {
                type: Sequelize.STRING,
                allowNull: true,
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('Videos');

        if (tableInfo.linkBunny) {
            await queryInterface.removeColumn('Videos', 'linkBunny');
        }
    }
};
