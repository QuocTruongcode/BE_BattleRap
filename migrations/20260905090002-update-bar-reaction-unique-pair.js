'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const [duplicates] = await queryInterface.sequelize.query(`
            SELECT [barID], [userID], COUNT(*) AS [count]
            FROM [BarReactions]
            GROUP BY [barID], [userID]
            HAVING COUNT(*) > 1
        `);

        if (duplicates.length > 0) {
            const duplicatePairs = duplicates
                .map(({ barID, userID }) => `(${barID}, ${userID})`)
                .join(', ');

            throw new Error(
                `Không thể tạo unique (barID, userID). Các cặp đã bị trùng: ${duplicatePairs}. ` +
                'Cần xử lý dữ liệu trùng trước khi chạy migration.'
            );
        }

        await queryInterface.sequelize.query(`
            IF EXISTS (
                SELECT 1
                FROM sys.objects
                WHERE name = 'barreaction_unique_bar_user_reaction'
                  AND parent_object_id = OBJECT_ID('[dbo].[BarReactions]')
            )
                ALTER TABLE [BarReactions]
                DROP CONSTRAINT [barreaction_unique_bar_user_reaction];
        `);

        await queryInterface.addConstraint('BarReactions', {
            fields: ['barID', 'userID'],
            type: 'unique',
            name: 'barreaction_unique_bar_user'
        });
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query(`
            IF EXISTS (
                SELECT 1
                FROM sys.objects
                WHERE name = 'barreaction_unique_bar_user'
                  AND parent_object_id = OBJECT_ID('[dbo].[BarReactions]')
            )
                ALTER TABLE [BarReactions]
                DROP CONSTRAINT [barreaction_unique_bar_user];
        `);

        await queryInterface.addConstraint('BarReactions', {
            fields: ['barID', 'userID', 'ReactionType'],
            type: 'unique',
            name: 'barreaction_unique_bar_user_reaction'
        });
    }
};