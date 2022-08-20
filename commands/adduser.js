const { SlashCommandBuilder } = require("@discordjs/builders");
const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adduser")
    .setDescription("user can add address, fetch summary and manage address!")
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

    console.log(user, integration.user);
    const _isAllow = await isAllow(integration.user);

    if (!_isAllow) content = "Only admin can add user";
    else if (user.bot) {
      content = "user can't be bot";
    } else {
      try {
        const _user = await models.Users.create({
          name: user.username,
          discriminator: user.discriminator,
          role,
        });
        content = `${user.username} added as a ${
          _user.role == 1 ? "admin" : _user.role == 2 ? "manager" : "guest"
        }`;
      } catch (err) {
        content = `${user.username} already added`;
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
