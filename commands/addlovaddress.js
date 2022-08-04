const { SlashCommandBuilder } = require("@discordjs/builders");
const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addlovaddress")
    .setDescription("add lov address")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Name of Lov address")
        .setRequired(true),
    )
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
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("ephemeral")
        .setDescription("yes mean only you can see a message")
        .setRequired(false),
    ),

  async execute(interation) {
    let content = "test ok";
    const name = interation.options.getString("name");
    const walletAddress = interation.options.getString("walletaddress");
    const isSummary =
      interation.options.getBoolean("issummary") !== null
        ? interation.options.getBoolean("issummary")
        : true;
    const ephemeral = interation.options.getBoolean("ephemeral");

    const _isAllow = await isAllow(interation.user, 2);
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
    interation.reply({
      content: `${content}`,
      ephemeral: ephemeral,
    });
  },
};
