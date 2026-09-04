'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'google_sub', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('Users', 'google_sub');
    }
};