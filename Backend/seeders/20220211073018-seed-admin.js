'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('admins', [
      { 
        adminId: 1, 
        name: "Admin", 
        email: "admin@smt.com", 
        role: "admin", 
        password: "administrator", 
        departmentId: null
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', null, {});
  }
};
