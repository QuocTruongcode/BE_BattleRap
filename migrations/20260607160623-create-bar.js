'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bars', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      startTime: {
        type: Sequelize.FLOAT
      },
      endTime: {
        type: Sequelize.FLOAT
      },
      content: {
        type: Sequelize.TEXT
      },
      videoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Videos',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'createdAt'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updatedAt'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bars');
  }
};