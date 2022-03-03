'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'events', 'description', { type: Sequelize.STRING }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'events', 'description'
    );
  }
};
