"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("LovAddresses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      isSummary: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      walletAddress: {
        type: Sequelize.STRING,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("LovAddresses");
  },
};
