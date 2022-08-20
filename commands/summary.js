const { SlashCommandBuilder } = require("@discordjs/builders");
const { writeFileSync, existsSync } = require("fs");
const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("summary")
    .setDescription("fetch venari catch summary for all player")
    .addBooleanOption((option) =>
      option
        .setName("today")
        .setDescription("filter by today catch only")
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("private")
        .setDescription("yes mean only you can see a message")
        .setRequired(false),
    ),

  async execute(integration) {
    const isToday = integration.options.getBoolean("today");
    const ephemeral = integration.options.getBoolean("ephemeral");
    let summary = "";
    let fileData =
      "Name,Total experience,Total coin,Total Essence,Total energy\n";
    const _isAllow = await isAllow(integration.user, 3);
    if (!_isAllow) summary = "Only Admin can get summary";
    else {
      if (!existsSync("./summary.csv")) {
        await writeFileSync("./summary.csv", "");
      }
      try {
        const today = new Date();
        const _summary = await models.LovAddress.findAll({
          include: [
            {
              model: models.LovHistory,
              attributes: [
                "lovAddressId",
                [
                  models.sequelize.fn(
                    "sum",
                    models.sequelize.col("experience"),
                  ),
                  "total_experience",
                ],
                [
                  models.sequelize.fn("sum", models.sequelize.col("coin")),
                  "total_coin",
                ],
                [
                  models.sequelize.fn("sum", models.sequelize.col("essence")),
                  "total_essence",
                ],
                [
                  models.sequelize.fn("sum", models.sequelize.col("energy")),
                  "total_energy",
                ],
              ],
              where: isToday
                ? models.sequelize.where(
                    models.sequelize.fn(
                      "date",
                      models.sequelize.col("LovHistories.createdAt"),
                    ),
                    "=",
                    today.toISOString().substring(0, 10),
                  )
                : () => {},
              required: false,
            },
          ],
          where: { isSummary: true },
          group: ["walletAddress"],
        });
        _summary.map((account) => {
          const dataValues = account.dataValues.LovHistories[0]
            ? account.dataValues.LovHistories[0].dataValues
            : {
                total_experience: 0,
                total_coin: 0,
                total_essence: 0,
                total_energy: 0,
              };
          fileData += `${account.name},${dataValues.total_experience},${dataValues.total_coin},${dataValues.total_essence},${dataValues.total_energy}\n`;
          summary +=
            "```Name: " +
            account.name +
            ", Total experience: " +
            dataValues.total_experience +
            ", Total coin: " +
            dataValues.total_coin +
            ", Total Essence: " +
            dataValues.total_essence +
            ", Total energy: " +
            dataValues.total_energy +
            "```";
        });
        await writeFileSync("./summary.csv", fileData);
      } catch (err) {
        summary = `Input is ${err}`;
      }
    }
    integration.reply({
      content: "summary", //summary,
      files: _isAllow ? ["./summary.csv"] : [],
      ephemeral: ephemeral,
    });
  },
};
