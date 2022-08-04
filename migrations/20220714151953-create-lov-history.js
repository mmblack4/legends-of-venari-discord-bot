"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("LovHistories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lovAddressId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      experience: {
        type: Sequelize.INTEGER,
      },
      coin: {
        type: Sequelize.INTEGER,
      },
      essence: {
        type: Sequelize.INTEGER,
      },
      energy: {
        type: Sequelize.INTEGER,
      },
      createdAtServer: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("LovHistories");
  },
};
