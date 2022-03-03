'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leaveApplications', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      studentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'students',
          key: 'id'
        }
      },
      dateFrom: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      dateTo: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      duration: {
        type: Sequelize.INTEGER
      },
      reason: {
        type: Sequelize.TEXT
      },
      isApproved: {
        type: Sequelize.BOOLEAN
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('leaveApplications');
  }
};