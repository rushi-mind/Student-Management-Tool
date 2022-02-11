'use strict';

const data = require('../temp/seed-students');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('students', data);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('students', null, {});
  }
};