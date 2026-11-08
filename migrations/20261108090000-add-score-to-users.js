'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const usersTable = await queryInterface.describeTable('Users');

    if (!usersTable.score) {
      await queryInterface.addColumn('Users', 'score', {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      });
    }
  },

  async down(queryInterface) {
    const usersTable = await queryInterface.describeTable('Users');

    if (usersTable.score) {
      await queryInterface.removeColumn('Users', 'score');
    }
  }
};
