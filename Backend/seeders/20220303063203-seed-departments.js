'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    let departments = [
      {
        name: 'Computer Engineering',
        departmentCode: 101,
        departmentNameSlug: 'computer-engineering'
      },
      {
        name: 'Information Technology',
        departmentCode: 102,
        departmentNameSlug: 'information-technology'
      },
      {
        name: 'Electronics & Communication',
        departmentCode: 103,
        departmentNameSlug: 'electronics-&-communication'
      },
      {
        name: 'Electrical Engineering',
        departmentCode: 104,
        departmentNameSlug: 'electrical-engineering'
      },
      {
        name: 'Mechanical Engineering',
        departmentCode: 105,
        departmentNameSlug: 'mechanical-engineering'
      },
      {
        name: 'Civil Engineering',
        departmentCode: 106,
        departmentNameSlug: 'civil-engineering'
      },
    ];
    await queryInterface.bulkInsert('departments', departments);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('departments', null, {});
  }
};
