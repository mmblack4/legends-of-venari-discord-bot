const { SlashCommandBuilder } = require("@discordjs/builders");

const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("updatelovaddresssummary")
    .setDescription("update Lov address summary want or not")
    .addStringOption((option) =>
      option
        .setName("walletaddress")
        .setDescription("lov wallet address")
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName("issummary")
        .setDescription("Need summary for this Address")
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName("private")
        .setDescription("yes mean only you can see a message")
        .setRequired(false),
    ),
  async execute(integration) {
    let content = "test ok";
    const walletAddress = integration.options.getString("walletaddress");
    const isSummary = integration.options.getBoolean("issummary");
    const ephemeral = integration.options.getBoolean("private");
    const _isAllow = await isAllow(integration.user);

    if (!_isAllow) content = "Only admin can add user";
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

    integration.reply({
      content: `${content}`,
      ephemeral: ephemeral,
    });
  },
};
