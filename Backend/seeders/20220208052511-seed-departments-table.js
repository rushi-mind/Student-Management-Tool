'use strict';

const data = [
  {name: 'Computer Engineering'},
  {name: 'Information Technology'},
  {name: 'Civil Engineering'},
  {name: 'Mechanical Engineering'},
  {name: 'Electornics & Communication'},
  {name: 'Electrical Enginnering'}
];

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('departments', data);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('departments', null, {});
  }
};
