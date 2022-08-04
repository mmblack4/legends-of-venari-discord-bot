const models = require("../models/index");

/**
 *
 * @param {*} param0
 * @returns
 */
const isAllow = async ({ username, discriminator }, roleUpTo = 1) => {
  const user = (
    await models.Users.findAll({
      where: { name: username, discriminator: discriminator },
    })
  )[0];
  console.log(user);
  return user ? user.role <= roleUpTo : false;
};
module.exports = isAllow;
