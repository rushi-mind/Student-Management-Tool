'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    static associate(models) {
      this.hasMany(models.Assignment);
      this.hasMany(models.Student);
      this.hasMany(models.Admin);
      this.hasMany(models.Timetable);
    }
  }

  Department.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    departmentCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    departmentNameSlug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Department',
    tableName: 'departments',
    timestamps: false
  });

  return Department;
};