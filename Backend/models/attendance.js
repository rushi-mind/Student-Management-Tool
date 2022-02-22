'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
      this.belongsTo(models.Student, {
        foreignKey: 'studentId'
      });
    }
  }

  // init method to define model
  Attendance.init({
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'date']
      }
    ],
    sequelize,
    modelName: 'Attendance',
    tableName: 'attendance',
    timestamps: false
  });

  return Attendance;
};