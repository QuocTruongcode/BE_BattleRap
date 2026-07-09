'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('AllCodes', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            KeyMap: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true
            },
            Type: {
                type: Sequelize.STRING
            },
            ValueVi: {
                type: Sequelize.STRING
            },
            ValueEn: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        const table = await queryInterface.describeTable('Bars');
        if (!table.barType) {
            await queryInterface.addColumn('Bars', 'barType', {
                type: Sequelize.STRING,
                allowNull: true,
                references: {
                    model: 'AllCodes',
                    key: 'KeyMap'
                },
                onDelete: 'SET NULL'
            });
        }

        await queryInterface.createTable('Entities', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            EntityType: {
                type: Sequelize.STRING
            },
            RefID: {
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.createTable('BarRelationships', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            RelationType: {
                type: Sequelize.STRING,
                allowNull: true,
                references: {
                    model: 'AllCodes',
                    key: 'KeyMap'
                },
                onDelete: 'SET NULL'
            },
            SourceBarID: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Bars',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            TargetBarID: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            EntityID: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Entities',
                    key: 'id'
                },
                onDelete: 'SET NULL'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('BarRelationships');
        await queryInterface.dropTable('Entities');
        await queryInterface.dropTable('AllCodes');
    }
};
