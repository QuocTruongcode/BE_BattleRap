'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('reactionComment', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE'
            },
            commentID: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'commentVideo',
                    key: 'id'
                },
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE'
            },
            replyCommentID: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'replyComment',
                    key: 'id'
                },
                onDelete: 'NO ACTION',
                onUpdate: 'CASCADE'
            },
            reaction: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.addConstraint('reactionComment', {
            fields: ['commentID', 'replyCommentID'],
            type: 'check',
            name: 'reactioncomment_exactly_one_target',
            where: Sequelize.literal(
                '([commentID] IS NULL AND [replyCommentID] IS NOT NULL) OR ' +
                '([commentID] IS NOT NULL AND [replyCommentID] IS NULL)'
            )
        });

        await queryInterface.addConstraint('reactionComment', {
            fields: ['reaction'],
            type: 'check',
            name: 'reactioncomment_valid_reaction',
            where: Sequelize.literal('[reaction] IS NULL OR [reaction] IN (0, 1)')
        });

        for (const column of ['dissLike', 'like']) {
            await queryInterface.sequelize.query(`
                DECLARE @constraintName sysname;
                SELECT @constraintName = dc.name
                FROM sys.default_constraints dc
                INNER JOIN sys.columns c
                    ON c.object_id = dc.parent_object_id
                    AND c.column_id = dc.parent_column_id
                WHERE dc.parent_object_id = OBJECT_ID(N'[dbo].[replyComment]')
                    AND c.name = N'${column}';

                IF @constraintName IS NOT NULL
                BEGIN
                    DECLARE @sql nvarchar(4000);
                    SET @sql = N'ALTER TABLE [replyComment] DROP CONSTRAINT ' + QUOTENAME(@constraintName);
                    EXEC sp_executesql @sql;
                END;
            `);
            await queryInterface.removeColumn('replyComment', column);
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('replyComment', 'like', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        });
        await queryInterface.addColumn('replyComment', 'dissLike', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        });
        await queryInterface.dropTable('reactionComment');
    }
};
