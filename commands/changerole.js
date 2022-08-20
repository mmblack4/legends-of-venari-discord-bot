const { SlashCommandBuilder } = require("@discordjs/builders");
const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changerole")
    .setDescription("change role to added user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("who want to add")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("admin: 1, manager: 2, guest: 3")
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
    const role = integration.options.getString("role");
    const ephemeral = integration.options.getBoolean("private");
    const _isAllow = await isAllow(integration.user);

    if (!_isAllow) content = "Only admin can add user";
    else if (user.bot) content = "user can't be bot";
    else {
      const _user = await models.Users.findAll({
        where: { name: user.username, discriminator: user.discriminator },
      });

      if (_user.length > 0) {
        const _user = await models.Users.update(
          {
            role,
          },
          {
            where: { name: user.username, discriminator: user.discriminator },
          },
        );
        content = `${user.username} added as a ${
          role == 1 ? "admin" : role == 2 ? "manager" : "guest"
        }`;
      } else {
        content = `${user.username} user not added`;
      }
    }
    integration.reply({
      content: `${content}`,
      ephemeral: ephemeral,
    });
  },
};
