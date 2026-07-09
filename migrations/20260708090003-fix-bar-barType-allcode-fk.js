'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('Bars');

        if (table.barType) {
            await queryInterface.sequelize.query(`
        IF NOT EXISTS (
          SELECT 1
          FROM sys.foreign_keys fk
          JOIN sys.foreign_key_columns fkc
            ON fk.object_id = fkc.constraint_object_id
          WHERE OBJECT_NAME(fk.parent_object_id) = 'Bars'
            AND COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = 'barType'
        )
        BEGIN
          ALTER TABLE [Bars]
          WITH CHECK ADD CONSTRAINT [FK_Bars_barType_AllCodes_KeyMap]
          FOREIGN KEY ([barType]) REFERENCES [AllCodes] ([KeyMap])
          ON DELETE SET NULL
          ON UPDATE CASCADE;

          ALTER TABLE [Bars] CHECK CONSTRAINT [FK_Bars_barType_AllCodes_KeyMap];
        END
      `);
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`
      IF EXISTS (
        SELECT 1
        FROM sys.foreign_keys
        WHERE object_id = OBJECT_ID(N'[dbo].[FK_Bars_barType_AllCodes_KeyMap]')
      )
      BEGIN
        ALTER TABLE [Bars] DROP CONSTRAINT [FK_Bars_barType_AllCodes_KeyMap];
      END
    `);
    }
};
