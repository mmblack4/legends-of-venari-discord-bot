const models = require("../models/index");

const summaryBy = async ({ lovAddressId, date }) => {
  const summary = await models.LovHistory.findAll({
    attributes: [
      "lovAddressId",
      [
        models.sequelize.fn("sum", models.sequelize.col("experience")),
        "total_experience",
      ],
      [models.sequelize.fn("sum", models.sequelize.col("coin")), "total_coin"],
      [
        models.sequelize.fn("sum", models.sequelize.col("essence")),
        "total_essence",
      ],
      [
        models.sequelize.fn("sum", models.sequelize.col("energy")),
        "total_energy",
      ],
    ],

    where: {
      createdAt: models.sequelize.where(
        models.sequelize.fn("date", models.sequelize.col("createdAt")),
        "=",
        date,
      ),
      lovAddressId,
    },

    group: ["lovAddressId"],
  });
  return summary;
};
module.exports = summaryBy;
