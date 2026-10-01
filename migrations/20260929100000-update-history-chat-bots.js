'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableName = 'historyChatBots';
        const columns = await queryInterface.describeTable(tableName);
        const hasNewColumns = columns.content && columns.role;
        const hasOldColumns = columns.question && columns.answer;

        if (hasNewColumns && !hasOldColumns) {
            return;
        }

        if (!hasOldColumns || hasNewColumns) {
            throw new Error(
                'historyChatBots must have question and answer columns, or content and role columns.'
            );
        }

        await queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.addColumn(tableName, 'content', {
                type: Sequelize.TEXT,
                allowNull: true
            }, { transaction });
            await queryInterface.addColumn(tableName, 'role', {
                type: Sequelize.STRING,
                allowNull: true
            }, { transaction });

            await queryInterface.sequelize.query(`
                UPDATE [historyChatBots]
                SET [content] = [question], [role] = 'user';

                INSERT INTO [historyChatBots]
                    ([conversationID], [UserID], [role], [content], [createdAt], [updatedAt])
                SELECT [conversationID], [UserID], 'assistant', [answer], [createdAt], [updatedAt]
                FROM [historyChatBots];
            `, { transaction });

            await queryInterface.removeColumn(tableName, 'question', { transaction });
            await queryInterface.removeColumn(tableName, 'answer', { transaction });
            await queryInterface.changeColumn(tableName, 'content', {
                type: Sequelize.TEXT,
                allowNull: false
            }, { transaction });
            await queryInterface.changeColumn(tableName, 'role', {
                type: Sequelize.STRING,
                allowNull: false
            }, { transaction });
        });
    },

    async down(queryInterface, Sequelize) {
        const tableName = 'historyChatBots';
        const columns = await queryInterface.describeTable(tableName);
        const hasNewColumns = columns.content && columns.role;

        if (!hasNewColumns) {
            return;
        }

        const [rows] = await queryInterface.sequelize.query(
            'SELECT COUNT(*) AS [count] FROM [historyChatBots]'
        );
        if (Number(rows[0].count) > 0) {
            throw new Error(
                'Cannot safely reverse historyChatBots role/content migration while history rows exist.'
            );
        }

        await queryInterface.sequelize.transaction(async transaction => {
            await queryInterface.removeColumn(tableName, 'content', { transaction });
            await queryInterface.removeColumn(tableName, 'role', { transaction });
            await queryInterface.addColumn(tableName, 'question', {
                type: Sequelize.TEXT,
                allowNull: false
            }, { transaction });
            await queryInterface.addColumn(tableName, 'answer', {
                type: Sequelize.TEXT,
                allowNull: false
            }, { transaction });
        });
    }
};