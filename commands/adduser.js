const { SlashCommandBuilder } = require("@discordjs/builders");
const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adduser")
    .setDescription("add user how can manage!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("how want to add")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("super admin: 1, admin: 2, user: 3")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("ephemeral")
        .setDescription("yes mean only you can see a message")
        .setRequired(false),
    ),

  async execute(interation) {
    let content = "test ok";
    const user = interation.options.getUser("user");
    const role = interation.options.getString("role");
    const ephemeral =
      interation.options.getString("ephemeral") &&
      interation.options.getString("ephemeral").search(/yes/i) !== -1
        ? true
        : false;
    console.log(user, interation.user);
    const _isAllow = await isAllow(interation.user);

    if (_isAllow === false) content = "Only Super Admin can add user";
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
          _user.role == 1 ? "Super Admin" : _user.role == 2 ? "Admin" : "User"
        }`;
      } catch (err) {
        content = `${user.username} already added`;
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
