const { SlashCommandBuilder } = require("@discordjs/builders");
const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addchannel")
    .setDescription("Add channel to show venari catch and summary")
    .addChannelOption((option) =>
      option
        .setName("tier1")
        .setDescription("update tier 1 venari catch")
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("tier2")
        .setDescription("update tier 2 venari catch")
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("tier3")
        .setDescription("update tier 3 venari catch")
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("summary")
        .setDescription("update daily summary")
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
    const tier1 = integration.options.getChannel("tier1");
    const tier2 = integration.options.getChannel("tier2");
    const tier3 = integration.options.getChannel("tier3");
    const summary = integration.options.getChannel("summary");
    const ephemeral = integration.options.getBoolean("private");

    const _isAllow = await isAllow(interation.user, 2);

    if (!_isAllow) content = "only admin can add channel";
    else {
      try {
        await models.ChannelList.bulkCreate([
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
    integration.reply({
      content: `${content}`,
      ephemeral: ephemeral,
    });
  },
};
