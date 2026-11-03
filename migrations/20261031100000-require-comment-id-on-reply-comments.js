'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.sequelize.query(`
                CREATE TABLE #RepliesToDelete ([id] INT NOT NULL PRIMARY KEY);

                INSERT INTO #RepliesToDelete ([id])
                SELECT [id]
                FROM [replyComment]
                WHERE [commentID] IS NULL;

                DECLARE @insertedRows INT = 1;
                WHILE @insertedRows > 0
                BEGIN
                    INSERT INTO #RepliesToDelete ([id])
                    SELECT child.[id]
                    FROM [replyComment] child
                    INNER JOIN #RepliesToDelete parent ON child.[replyCommentID] = parent.[id]
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM #RepliesToDelete existing
                        WHERE existing.[id] = child.[id]
                    );
                    SET @insertedRows = @@ROWCOUNT;
                END;

                DELETE FROM [reactionComment]
                WHERE [replyCommentID] IN (SELECT [id] FROM #RepliesToDelete);

                WHILE EXISTS (
                    SELECT 1
                    FROM [replyComment] parent
                    INNER JOIN #RepliesToDelete marked ON marked.[id] = parent.[id]
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM [replyComment] child
                        WHERE child.[replyCommentID] = parent.[id]
                    )
                )
                BEGIN
                    DELETE parent
                    FROM [replyComment] parent
                    INNER JOIN #RepliesToDelete marked ON marked.[id] = parent.[id]
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM [replyComment] child
                        WHERE child.[replyCommentID] = parent.[id]
                    );
                END;

                DROP TABLE #RepliesToDelete;
            `, { transaction });

            await queryInterface.changeColumn('replyComment', 'commentID', {
                type: Sequelize.INTEGER,
                allowNull: false
            }, { transaction });
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('replyComment', 'commentID', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
    }
};
