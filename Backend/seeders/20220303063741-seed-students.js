'use strict';

let students = require('../temp/seed-students');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('students', students);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('students', null, {});
  }
};
