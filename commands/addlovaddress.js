const { SlashCommandBuilder } = require("@discordjs/builders");
const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addlovaddress")
    .setDescription("add lov address to get venari catch and summary")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of Lov address")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("walletaddress")
        .setDescription("lov ether wallet address")
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName("issummary")
        .setDescription("Need summary for this address")
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("private")
        .setDescription("yes mean only you can see a message")
        .setRequired(false),
    ),

  async execute(integration) {
    let content = "test ok";
    const name = integration.options.getString("name");
    const walletAddress = integration.options.getString("walletaddress");
    const isSummary =
      integration.options.getBoolean("issummary") !== null
        ? integration.options.getBoolean("issummary")
        : true;
    const ephemeral = integration.options.getBoolean("private");

    const _isAllow = await isAllow(integration.user, 2);
    if (_isAllow === false) content = "Only Admin can add LovAddress";
    else {
      try {
        const lovAddress = await models.LovAddress.create({
          name,
          walletAddress,
          isSummary,
        });
        content = `LovAddress '${lovAddress.walletAddress}' added`;
      } catch (error) {
        content = `LovAddress ${walletAddress} already added`;
      }
    }
    try {
    } catch (err) {
      content = `Input is ${err}`;
    }
    integration.reply({
      content: `${content}`,
      ephemeral: ephemeral,
    });
  },
};
