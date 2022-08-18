const { SlashCommandBuilder } = require("@discordjs/builders");
const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addchannel")
    .setDescription("addchannel")
    .addChannelOption((option) =>
      option
        .setName("tier1")
        .setDescription("update tier 1 data")
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("tier2")
        .setDescription("update tier 2 data")
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("tier3")
        .setDescription("update tier 3 data")
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option.setName("summary").setDescription("summary").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("ephemeral")
        .setDescription("yes mean only you can see a message")
        .setRequired(false),
    ),

  async execute(interation) {
    let content = "test ok";
    const tier1 = interation.options.getChannel("tier1");
    const tier2 = interation.options.getChannel("tier2");
    const tier3 = interation.options.getChannel("tier3");
    const summary = interation.options.getChannel("summary");
    const ephemeral =
      interation.options.getString("ephemeral") &&
      interation.options.getString("ephemeral").search(/yes/i) !== -1
        ? true
        : false;

    const _isAllow = await isAllow(interation.user, 2);
    if (_isAllow === false) content = "Only Admin can add webhook";
    else {
      try {
        const channelList = await models.ChannelList.bulkCreate([
          {
            channelId: tier1.id,
            name: tier1.name,
          },
          {
            channelId: tier2.id,
            name: tier2.name,
          },
          {
            channelId: tier3.id,
            name: tier3.name,
          },
          {
            channelId: summary.id,
            name: summary.name,
          },
        ]);
        content = `channelList ${tier1.toString()},${tier2.toString()},${tier3.toString()},${summary.toString()} added`;
      } catch (error) {
        content = `channelList ${tier1.toString()},${tier2.toString()},${tier3.toString()},${summary.toString()} already added`;
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
