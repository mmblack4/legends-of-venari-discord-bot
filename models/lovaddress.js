"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LovAddress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.LovHistory, {
        foreignKey: "lovAddressId",
      });
    }
  }
  LovAddress.init(
    {
      name: DataTypes.STRING,
      isSummary: DataTypes.BOOLEAN,
      walletAddress: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "LovAddress",
    },
  );
  return LovAddress;
};
