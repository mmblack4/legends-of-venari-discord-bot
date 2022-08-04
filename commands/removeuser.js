const { SlashCommandBuilder } = require("@discordjs/builders");
const models = require("../models/index");
const isAllow = require("../util/isAllow");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removeuser")
    .setDescription("add user how can manage!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("how want to add")
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName("ephemeral")
        .setDescription("yes mean only you can see a message")
        .setRequired(false),
    ),

  async execute(interation) {
    let content = "test ok";
    const user = interation.options.getUser("user");
    const ephemeral =
      interation.options.getBoolean("ephemeral") !== null
        ? interation.options.getBoolean("ephemeral")
        : false;
    const _isAllow = await isAllow(interation.user);

    if (_isAllow === false) content = "Only Super Admin can add user";
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
    interation.reply({
      content: `${content}`,
      ephemeral: ephemeral,
    });
  },
};
