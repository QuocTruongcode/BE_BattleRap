'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.removeConstraint(
            'BarReactions',
            'barreaction_unique_bar_reaction'
        );

        await queryInterface.addConstraint('BarReactions', {
            fields: ['barID', 'userID', 'ReactionType'],
            type: 'unique',
            name: 'barreaction_unique_bar_user_reaction'
        });
    },

    async down(queryInterface) {
        await queryInterface.removeConstraint(
            'BarReactions',
            'barreaction_unique_bar_user_reaction'
        );

        await queryInterface.addConstraint('BarReactions', {
            fields: ['barID', 'ReactionType'],
            type: 'unique',
            name: 'barreaction_unique_bar_reaction'
        });
    }
};