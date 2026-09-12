'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('Bars');

        if (table.barttelID) {
            const constraintName = 'FK_Bars_Battler';

            try {
                await queryInterface.addConstraint('Bars', {
                    fields: ['barttelID'],
                    type: 'foreign key',
                    name: constraintName,
                    references: {
                        table: 'Battlers',
                        field: 'id'
                    },
                    onDelete: 'SET NULL',
                    onUpdate: 'CASCADE'
                });
            } catch (error) {
                if (!error.message || !error.message.includes('already exists')) {
                    throw error;
                }
            }
        }
    },

    async down(queryInterface) {
        try {
            await queryInterface.removeConstraint('Bars', 'FK_Bars_Battler');
        } catch (error) {
            if (!error.message || !error.message.includes('does not exist')) {
                throw error;
            }
        }
    }
};
