'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'assignments', 'filePath',
        {
          type: Sequelize.STRING
        }
      )
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn(
        'assignments', 'filePath'
      )
    ]);
  }
};
