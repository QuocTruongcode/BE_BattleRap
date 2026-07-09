'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('Bars');

        if (!table.startTime) {
            await queryInterface.addColumn('Bars', 'startTime', {
                type: Sequelize.FLOAT,
                allowNull: true
            });
        }

        if (!table.content) {
            await queryInterface.addColumn('Bars', 'content', {
                type: Sequelize.TEXT,
                allowNull: true
            });
        }

        if (!table.videoId) {
            await queryInterface.addColumn('Bars', 'videoId', {
                type: Sequelize.INTEGER,
                allowNull: true
            });
        }

        if (!table.barttelID) {
            await queryInterface.addColumn('Bars', 'barttelID', {
                type: Sequelize.INTEGER,
                allowNull: true
            });
        }

        if (!table.barType) {
            await queryInterface.addColumn('Bars', 'barType', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        if (table.endTime) {
            await queryInterface.removeColumn('Bars', 'endTime');
        }
    },

    async down(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('Bars');

        if (!table.endTime) {
            await queryInterface.addColumn('Bars', 'endTime', {
                type: Sequelize.FLOAT,
                allowNull: true
            });
        }

        if (table.barttelID) {
            await queryInterface.removeColumn('Bars', 'barttelID');
        }

        if (table.barType) {
            await queryInterface.removeColumn('Bars', 'barType');
        }
    }
};
