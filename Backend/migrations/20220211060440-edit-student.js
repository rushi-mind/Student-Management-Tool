'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'students', 'address',
        {
          type: Sequelize.STRING
        }
      ),
      queryInterface.addColumn(
        'students', 'bloodGroup',
        {
          type: Sequelize.ENUM,
          values: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
        }
      )
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn(
        'students', 'address'
      ),
      queryInterface.removeColumn(
        'students', 'bloodGroup'
      )
    ]);
  }
};
