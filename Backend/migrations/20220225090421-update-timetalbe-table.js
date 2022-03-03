'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addConstraint(
        'timetable',
        {
          fields: ['departmentId', 'semester', 'lectureNo'],
          type: 'unique',
          name: 'unique_deptId_sem_lecNo'
        }
      )
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeConstraint(
        'timetable', 'unique_deptId_sem_lecNo'
      )
    ]);
  }
};