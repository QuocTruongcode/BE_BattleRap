'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('BarRelationships');

        if (tableInfo.TargetBarID) {
            await queryInterface.removeColumn('BarRelationships', 'TargetBarID');
        }

        const entityTableInfo = await queryInterface.describeTable('Entities');
        if (!entityTableInfo.EntityType) {
            await queryInterface.addColumn('Entities', 'EntityType', {
                type: Sequelize.STRING,
                allowNull: true
            });
        }

        if (!entityTableInfo.RefID) {
            await queryInterface.addColumn('Entities', 'RefID', {
                type: Sequelize.INTEGER,
                allowNull: true
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('BarRelationships');
        if (!tableInfo.TargetBarID) {
            await queryInterface.addColumn('BarRelationships', 'TargetBarID', {
                type: Sequelize.INTEGER,
                allowNull: true
            });
        }
    }
};
