const { SlashCommandBuilder } = require("@discordjs/builders");
const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removeuser")
    .setDescription(
      "remove user from add address, fetch summary and manage address!",
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("who want to add")
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
    const user = integration.options.getUser("user");
    const ephemeral = integration.options.getBoolean("private");
    const _isAllow = await isAllow(integration.user);

    if (!_isAllow) content = "Only admin can add user";
    else if (user.bot) content = "user can't be bot";
    else {
      const _user = await models.Users.findAll({
        where: { name: user.username, discriminator: user.discriminator },
      });

      if (_user.length > 0) {
        const _user = await models.Users.destroy({
          where: { name: user.username, discriminator: user.discriminator },
        });
        content = `${user.username} user removed`;
      } else {
        content = `${user.username} user not found`;
      }
    }
    integration.reply({
      content: `${content}`,
      ephemeral: ephemeral,
    });
  },
};
