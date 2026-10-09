'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [rows] = await queryInterface.sequelize.query(
      'SELECT [id], [review] FROM [DramaEvents] WHERE [review] IS NOT NULL'
    );

    for (const row of rows) {
      await queryInterface.bulkUpdate(
        'DramaEvents',
        { review: JSON.stringify(row.review) },
        { id: row.id }
      );
    }

    await queryInterface.changeColumn('DramaEvents', 'review', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    const [rows] = await queryInterface.sequelize.query(
      'SELECT [id], [review] FROM [DramaEvents] WHERE [review] IS NOT NULL'
    );

    for (const row of rows) {
      let value;
      try {
        value = JSON.parse(row.review);
      } catch {
        continue;
      }

      if (typeof value === 'string') {
        await queryInterface.bulkUpdate(
          'DramaEvents',
          { review: value },
          { id: row.id }
        );
      }
    }

    await queryInterface.changeColumn('DramaEvents', 'review', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  }
};
