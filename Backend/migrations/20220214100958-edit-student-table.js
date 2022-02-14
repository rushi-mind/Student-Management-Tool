'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'students', 'profileImagePath',
        {
          type: Sequelize.STRING
        }
      )
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn(
        'students', 'profileImagePath'
      )
    ]);
  }
};
