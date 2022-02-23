'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Assignment extends Model {
    static associate(models) {
      this.belongsTo(models.Department, {
        foreignKey: 'departmentId'
      });
    }
  }

  // init method to define model
  Assignment.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    semester: {
      type: DataTypes.ENUM,
      values: ['1','2','3','4','5','6','7','8'],
      allowNull: false
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departments',
        key: 'id'
      }
    },
    deadline: {
      type: DataTypes.DATEONLY
    },
    filePath: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Assignment',
    tableName: 'assignments',
    timestamps: false
  });

  return Assignment;
};