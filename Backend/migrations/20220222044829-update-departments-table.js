'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'departments', 'departmentCode',
        {
          type: Sequelize.INTEGER
        }
      ),
      queryInterface.addColumn(
        'departments', 'departmentNameSlug',
        {
          type: Sequelize.STRING
        }
      ),
      queryInterface.addConstraint(
        'departments',
        {
          fields: ['departmentCode'],
          type: 'unique',
          name: 'unique_departmentCode'
        }
      ),
      queryInterface.addConstraint(
        'departments',
        {
          fields: ['departmentNameSlug'],
          type: 'unique',
          name: 'unique_departmentNameSlug'
        }
      )
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn(
        'departments', 'departmentCode'
      ),
      queryInterface.removeColumn(
        'departments', 'departmentNameSlug'
      ),
      queryInterface.removeConstraint(
        'departments',
        'unique_departmentCode'
      ),
      queryInterface.removeConstraint(
        'departments',
        'unique_departmentNameSlug'
      )
    ]);
  }
};