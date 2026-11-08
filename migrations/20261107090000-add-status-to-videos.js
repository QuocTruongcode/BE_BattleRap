'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Videos', 'status', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addConstraint('Videos', {
      fields: ['status'],
      type: 'check',
      where: {
        status: [0, 1]
      },
      name: 'CK_Videos_status_0_or_1'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('Videos', 'CK_Videos_status_0_or_1');
    await queryInterface.removeColumn('Videos', 'status');
  }
};
