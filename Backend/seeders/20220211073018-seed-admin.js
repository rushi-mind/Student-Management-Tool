'use strict';

const bcrypt = require('bcrypt');

const getPassword = async () => {
  const password = process.env.adminPassword;
  let salt = await bcrypt.genSalt(10);
  let hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    let password = await getPassword();
    await queryInterface.bulkInsert('admins', [
      { 
        adminId: 1, 
        name: "Admin", 
        email: "admin@smt.com", 
        role: "admin", 
        password, 
        departmentId: null
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admins', null, {});
  }
};
