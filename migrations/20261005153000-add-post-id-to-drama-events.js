'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('DramaEvents');

    if (!tableInfo.postId) {
      await queryInterface.addColumn('DramaEvents', 'postId', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('DramaEvents');

    if (tableInfo.postId) {
      await queryInterface.removeColumn('DramaEvents', 'postId');
    }
  }
};
