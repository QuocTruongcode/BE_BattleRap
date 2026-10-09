'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('DramaEvents');

    if (!tableInfo.videoID) {
      await queryInterface.addColumn('DramaEvents', 'videoID', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Videos',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('DramaEvents');

    if (tableInfo.videoID) {
      await queryInterface.removeColumn('DramaEvents', 'videoID');
    }
  }
};
