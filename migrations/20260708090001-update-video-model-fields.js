'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('Videos');

        if (!tableInfo.battlerID) {
            await queryInterface.addColumn('Videos', 'battlerID', {
                type: Sequelize.INTEGER,
                allowNull: true
            });
        }

        if (!tableInfo.review) {
            await queryInterface.addColumn('Videos', 'review', {
                type: Sequelize.TEXT,
                allowNull: true
            });
        }

        if (!tableInfo.eventID) {
            await queryInterface.addColumn('Videos', 'eventID', {
                type: Sequelize.INTEGER,
                allowNull: true
            });
        }

        if (!tableInfo.cleanScore) {
            await queryInterface.addColumn('Videos', 'cleanScore', {
                type: Sequelize.FLOAT,
                allowNull: true
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('Videos');

        if (tableInfo.cleanScore) {
            await queryInterface.removeColumn('Videos', 'cleanScore');
        }
        if (tableInfo.eventID) {
            await queryInterface.removeColumn('Videos', 'eventID');
        }
        if (tableInfo.review) {
            await queryInterface.removeColumn('Videos', 'review');
        }
        if (tableInfo.battlerID) {
            await queryInterface.removeColumn('Videos', 'battlerID');
        }
    }
};
