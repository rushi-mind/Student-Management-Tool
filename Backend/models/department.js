'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    static associate(models) {
      
    }
  }

  Department.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    departmentCod: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    departmentNameSlug: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['departmentCode']
      },
      {
        unique: true,
        fields: ['departmentNameSlug']
      }
    ],
    sequelize,
    modelName: 'Department',
    tableName: 'departments',
    timestamps: false
  });

  return Department;
};