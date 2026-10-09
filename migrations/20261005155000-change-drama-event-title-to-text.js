'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('DramaEvents', 'title', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    const [results] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) AS [count]
      FROM [DramaEvents]
      WHERE DATALENGTH([title]) > 510
    `);

    if (Number(results[0].count) > 0) {
      throw new Error(
        'Không thể đổi DramaEvents.title về STRING(255) vì có dữ liệu dài hơn 255 ký tự. ' +
        'Cần rút ngắn các title trước khi rollback migration.'
      );
    }

    await queryInterface.changeColumn('DramaEvents', 'title', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
