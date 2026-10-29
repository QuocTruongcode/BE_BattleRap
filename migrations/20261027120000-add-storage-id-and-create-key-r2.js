'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const videoTable = await queryInterface.describeTable('Videos');

    if (!videoTable.storageId) {
      await queryInterface.addColumn('Videos', 'storageId', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    await queryInterface.createTable('KeyR2', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      VideoID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Videos',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      key: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('KeyR2');

    const videoTable = await queryInterface.describeTable('Videos');
    if (videoTable.storageId) {
      await queryInterface.removeColumn('Videos', 'storageId');
    }
  }
};
