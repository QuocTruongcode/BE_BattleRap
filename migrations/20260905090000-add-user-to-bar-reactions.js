"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const guestUserId = 5;
        const [guestUsers] = await queryInterface.sequelize.query(
            'SELECT [id] FROM [Users] WHERE [id] = :guestUserId',
            { replacements: { guestUserId } }
        );

        if (guestUsers.length === 0) {
            throw new Error(`User mặc định với ID ${guestUserId} không tồn tại`);
        }

        await queryInterface.addColumn('BarReactions', 'userID', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'   // ← đã sửa
        });

        await queryInterface.sequelize.query(
            'UPDATE [BarReactions] SET [userID] = :guestUserId WHERE [userID] IS NULL',
            { replacements: { guestUserId } }
        );

        await queryInterface.changeColumn('BarReactions', 'userID', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'   // ← đã sửa
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('BarReactions', 'userID');
    }
};