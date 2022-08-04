const { Sequelize, Op } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
});

module.exports = { sequelize, Op };
