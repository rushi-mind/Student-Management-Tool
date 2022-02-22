'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LeaveApplication extends Model {
    static associate(models) {
      this.belongsTo(models.Student, {
        foreignKey: 'studentId'
      });
    }
  }
  LeaveApplication.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    dateFrom: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    dateTo: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER
    },
    reason: {
      type: DataTypes.TEXT
    },
    isApproved: {
      type: DataTypes.BOOLEAN
    }
  }, {
    sequelize,
    modelName: 'LeaveApplication',
    tableName: 'leaveApplications',
    timestamps: false
  });

  return LeaveApplication;
};