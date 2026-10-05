'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [duplicates] = await queryInterface.sequelize.query(`
      SELECT [dramaID], [postId], COUNT(*) AS [count]
      FROM [DramaEvents]
      WHERE [postId] IS NOT NULL
      GROUP BY [dramaID], [postId]
      HAVING COUNT(*) > 1
    `);

    if (duplicates.length > 0) {
      const duplicatePairs = duplicates
        .map(({ dramaID, postId }) => `(${dramaID}, ${postId})`)
        .join(', ');
      throw new Error(
        `Không thể tạo unique (dramaID, postId). Các cặp đã bị trùng: ${duplicatePairs}. ` +
        'Cần xử lý dữ liệu trùng trước khi chạy migration.'
      );
    }

    await queryInterface.sequelize.query(`
      IF NOT EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE name = 'drama_events_drama_post_unique'
          AND object_id = OBJECT_ID('[dbo].[DramaEvents]')
      )
        CREATE UNIQUE INDEX [drama_events_drama_post_unique]
        ON [dbo].[DramaEvents] ([dramaID], [postId])
        WHERE [postId] IS NOT NULL;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      IF EXISTS (
        SELECT 1
        FROM sys.indexes
        WHERE name = 'drama_events_drama_post_unique'
          AND object_id = OBJECT_ID('[dbo].[DramaEvents]')
      )
        DROP INDEX [drama_events_drama_post_unique] ON [dbo].[DramaEvents];
    `);
  }
};
