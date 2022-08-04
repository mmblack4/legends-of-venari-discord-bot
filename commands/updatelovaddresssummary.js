const { SlashCommandBuilder } = require("@discordjs/builders");

const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("updatelovaddresssummary")
    .setDescription("update Lov address summary")
    .addStringOption((option) =>
      option
        .setName("walletaddress")
        .setDescription("lov wallet Address.")
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName("issummary")
        .setDescription("Need summary for this Address")
        .setRequired(true),
    ),
  async execute(interation) {
    let content = "test ok";
    const walletAddress = interation.options.getString("walletaddress");
    const isSummary = interation.options.getBoolean("issummary");
    const _isAllow = await isAllow(interation.user);

    if (_isAllow === false) content = "Only Super Admin can add user";
    else {
      const _walletAddress = await models.LovAddress.findAll({
        where: { walletAddress },
      });

      if (_walletAddress.length > 0) {
        await models.LovAddress.update(
          {
            isSummary,
          },
          { where: { walletAddress } },
        );
        content = `${walletAddress} address summary update as ${isSummary}`;
      } else {
        content = `${walletAddress} address not found`;
      }
    }

    interation.reply({
      content: `${content}`,
    });
  },
};
