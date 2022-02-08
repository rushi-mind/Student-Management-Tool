'use strict';

const fs = require('fs')

module.exports = {
  async up (queryInterface, Sequelize) {
    const data = JSON.parse(fs.readFileSync('./temp/seed-students.json', {encoding:'utf8', flag:'r'}));
    await queryInterface.bulkInsert('students', data);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('students', null, {});
  }
};