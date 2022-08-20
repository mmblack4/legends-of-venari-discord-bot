const { SlashCommandBuilder } = require("@discordjs/builders");

const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removelovaddress")
    .setDescription("remove lov address from venari catch and summary")
    .addStringOption((option) =>
      option
        .setName("walletaddress")
        .setDescription("lov wallet address")
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
    const _isAllow = await isAllow(integration.user);
    const ephemeral = integration.options.getBoolean("private");

    if (!_isAllow) content = "Only admin can add user";
    else {
      const _walletAddress = await models.LovAddress.findAll({
        where: { walletAddress },
      });

      if (_walletAddress.length > 0) {
        await models.LovAddress.destroy({
          where: { walletAddress },
        });
        content = `${walletAddress} address removed`;
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
