'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const [duplicates] = await queryInterface.sequelize.query(`
            SELECT TOP (1) [userID], [replyCommentID], COUNT(*) AS [reactionCount]
            FROM [reactionComment]
            WHERE [replyCommentID] IS NOT NULL
            GROUP BY [userID], [replyCommentID]
            HAVING COUNT(*) > 1
        `);

        if (duplicates.length > 0) {
            throw new Error(
                `Không thể thêm unique index: userID=${duplicates[0].userID} đã có nhiều reaction cho replyCommentID=${duplicates[0].replyCommentID}`
            );
        }

        await queryInterface.addIndex('reactionComment', ['userID', 'replyCommentID'], {
            unique: true,
            name: 'reactioncomment_user_reply_unique',
            where: {
                replyCommentID: { [Sequelize.Op.not]: null }
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('reactionComment', 'reactioncomment_user_reply_unique');
    }
};
