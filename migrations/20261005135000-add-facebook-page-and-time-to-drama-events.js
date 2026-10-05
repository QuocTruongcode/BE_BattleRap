'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('DramaEvents');

    if (!tableInfo.facebookUrl) {
      await queryInterface.addColumn('DramaEvents', 'facebookUrl', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableInfo.pageName) {
      await queryInterface.addColumn('DramaEvents', 'pageName', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableInfo.time) {
      await queryInterface.addColumn('DramaEvents', 'time', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('DramaEvents');

    if (tableInfo.time) {
      await queryInterface.removeColumn('DramaEvents', 'time');
    }

    if (tableInfo.pageName) {
      await queryInterface.removeColumn('DramaEvents', 'pageName');
    }

    if (tableInfo.facebookUrl) {
      await queryInterface.removeColumn('DramaEvents', 'facebookUrl');
    }
  }
};
