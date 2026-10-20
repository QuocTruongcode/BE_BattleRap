'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.sequelize.query(`
                WITH RankedReactions AS (
                    SELECT [id],
                        ROW_NUMBER() OVER (
                            PARTITION BY [userID], [commentID]
                            ORDER BY [createdAt] ASC, [id] ASC
                        ) AS [rowNumber]
                    FROM [reactionComment]
                    WHERE [commentID] IS NOT NULL
                )
                DELETE FROM RankedReactions
                WHERE [rowNumber] > 1;
            `, { transaction });

            await queryInterface.addIndex('reactionComment', ['userID', 'commentID'], {
                unique: true,
                name: 'reactioncomment_user_comment_unique',
                where: {
                    commentID: { [Sequelize.Op.not]: null }
                },
                transaction
            });
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('reactionComment', 'reactioncomment_user_comment_unique');
    }
};
