const { SlashCommandBuilder } = require("@discordjs/builders");
const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changerole")
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
    const _isAllow = await isAllow(interation.user);

    if (_isAllow === false) content = "Only Super Admin can add user";
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
          role == 1 ? "Super Admin" : role == 2 ? "Admin" : "User"
        }`;
      } else {
        content = `${user.username} user not added`;
      }
    }
    interation.reply({
      content: `${content}`,
      ephemeral: ephemeral,
    });
  },
};