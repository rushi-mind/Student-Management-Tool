'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Timetable extends Model {
    static associate(models) {
      this.belongsTo(models.Department, {
        foreignKey: 'departmentId'
      });
    }
  }
  Timetable.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departments',
        key: 'id'
      }
    },
    semester: {
      type: DataTypes.ENUM,
      values: ['1','2','3','4','5','6','7','8'],
      allowNull: false
    },
    lectureNo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Monday: {
      type: DataTypes.STRING
    },
    Tuesday: {
      type: DataTypes.STRING
    },
    Wednesday: {
      type: DataTypes.STRING
    },
    Thursday: {
      type: DataTypes.STRING
    },
    Friday: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Timetable',
    tableName: 'timetable',
    timestamps: false
  });
  return Timetable;
};