'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addConstraint(
        'attendance',
        {
          fields: ['studentId', 'date'],
          type: 'unique',
          name: 'unique_studentId_date'
        }
      )
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeConstraint(
        'attendance',
        {
          fields: ['studentId', 'date'],
          type: 'unique',
          name: 'unique_studentId_date'
        }
      )
    ]);
  }
};
