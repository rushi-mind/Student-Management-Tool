'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('timetable', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      departmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departments',
          key: 'id'
        }
      },
      semester: {
        type: Sequelize.ENUM,
        values: ['1','2','3','4','5','6','7','8'],
        allowNull: false
      },
      lectureNo: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      Monday: {
        type: Sequelize.STRING
      },
      Tuesday: {
        type: Sequelize.STRING
      },
      Wednesday: {
        type: Sequelize.STRING
      },
      Thursday: {
        type: Sequelize.STRING
      },
      Friday: {
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('timetable');
  }
};