require("dotenv").config();

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, Intents, WebhookClient, Collection } = require("discord.js");

const fs = require("fs");
const axios = require("axios");
const moment = require("moment");
const cron = require("cron");
const { writeFileSync, existsSync } = require("fs");

// util
const isAllow = require("./util/isAllow");
const summaryBy = require("./util/summaryBy");

// models
const models = require("./models/index");

//
const Land = require("./land.json");

const client = new Client({
  partials: ["CHANNEL"],
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

//slash cmd setup
client.commands = new Collection();

//slash command
const commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!commands) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    if (err) console.error(err);
    await interaction.reply({
      content: "An error ",
      ephemeral: true,
    });
  }
});

const PREFIX = "$";
let isStartLov = false;

client.on("ready", async () => {
  const CLIENT_ID = client.user.id;

  const rest = new REST({
    version: "9",
  }).setToken(process.env.DISCORD_BOT_TOKEN);

  (async () => {
    try {
      if (process.env.NODE_ENV === "production") {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
          body: commands,
        });
      } else {
        await rest.put(
          Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_IDA),
          {
            body: commands,
          },
        );
      }
    } catch (err) {
      if (err) console.error(err);
    }
  })();
  try {
    await models.Users.create({
      name: "mmblack",
      discriminator: "6621",
      role: 1,
    });
  } catch (e) {
    console.log(e);
  }
  console.log(`${process.env.NODE_ENV}:${client.user.tag} has logged in.`);
});
const fetchSummary = async () => {
  const channelList = await models.ChannelList.findAll();
  const summaryChannel = await client.channels.fetch(channelList[3].channelId);
  if (!existsSync("./summary.csv")) {
    await writeFileSync("./summary.csv", "");
  }
  let summary = "";
  let fileData =
    "Name,Total experience,Total coin,Total Essence,Total energy\n";
  const today = new Date();
  const _summary = await models.LovAddress.findAll({
    include: [
      {
        model: models.LovHistory,
        attributes: [
          "lovAddressId",
          [
            models.sequelize.fn("sum", models.sequelize.col("experience")),
            "total_experience",
          ],
          [
            models.sequelize.fn("sum", models.sequelize.col("coin")),
            "total_coin",
          ],
          [
            models.sequelize.fn("sum", models.sequelize.col("essence")),
            "total_essence",
          ],
          [
            models.sequelize.fn("sum", models.sequelize.col("energy")),
            "total_energy",
          ],
        ],
        where: models.sequelize.where(
          models.sequelize.fn(
            "date",
            models.sequelize.col("LovHistories.createdAt"),
          ),
          "=",
          today.toISOString().substring(0, 10),
        ),
        required: false,
      },
    ],
    where: { isSummary: true },
    group: ["walletAddress"],
  });
  _summary.map((account) => {
    const dataValues = account.dataValues.LovHistories[0]
      ? account.dataValues.LovHistories[0].dataValues
      : {
          total_experience: 0,
          total_coin: 0,
          total_essence: 0,
          total_energy: 0,
        };
    fileData += `${account.name},${dataValues.total_experience},${dataValues.total_coin},${dataValues.total_essence},${dataValues.total_energy}\n`;
    summary +=
      "```Name: " +
      account.name +
      ", Total experience: " +
      dataValues.total_experience +
      ", Total coin: " +
      dataValues.total_coin +
      ", Total Essence: " +
      dataValues.total_essence +
      ", Total energy: " +
      dataValues.total_energy +
      "```";
  });
  await writeFileSync("./summary.csv", fileData);
  summaryChannel.send({
    content: "summary", //summary,
    files: ["./summary.csv"],
  });
};
const summaryJob = new cron.CronJob("00 50 23 * * *", fetchSummary);
client.on("message", async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(PREFIX)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);

    if (CMD_NAME === "startLov") {
      const _isAllow = await isAllow(message.author);
      if (!_isAllow) return message.channel.send("Only Admin can run this CMD");

      if (isStartLov) return message.reply("start lov is already running");
      isStartLov = true;
      summaryJob.start();
      setInterval(async () => {
        const channelList = await models.ChannelList.findAll();

        const addresList = await models.LovAddress.findAll();
        const tier1Channel = await client.channels.fetch(
          channelList[0].channelId,
        );
        const tier2Channel = await client.channels.fetch(
          channelList[1].channelId,
        );
        const tier3Channel = await client.channels.fetch(
          channelList[2].channelId,
        );

        addresList.map(async ({ walletAddress, id }) => {
          const url = `https://api.legendsofvenari.com/expeditions/history?limit=3&user=${walletAddress}`;
          try {
            const response = await axios.get(url);
            if (response.data.data) {
              const _data = response.data.data[0];

              const name = _data.user.username;
              const caught = _data.caught;
              const location = _data.location.name;
              const type = _data.venari.type;
              const tier = parseInt(_data.venari.tier);
              const createdAtServer = _data.createdAt;
              let coin = 0;
              let experience = 0;
              let essence = 0;
              let energy = Land[location] ? Land[location] : 0;
              //total
              let totalCoin = 0;
              let totalExperience = 0;
              let totalEssence = 0;
              let totalEnergy = 0;
              const history = await models.LovHistory.findAll({
                where: { createdAtServer, lovAddressId: id },
              });
              const today = new Date();
              const date = today.toISOString().substring(0, 10);
              const dailySummary = await summaryBy({
                lovAddressId: id,
                date,
              });

              if (history.length === 0) {
                _data.rewards.map(({ type, amount }) => {
                  switch (type) {
                    case "experience":
                      experience += parseInt(amount);
                      break;
                    case "coin":
                      coin += parseInt(amount);
                      break;
                    case "item":
                      essence += parseInt(amount);
                      break;
                  }
                });
                if (dailySummary[0] && dailySummary[0].dataValues) {
                  totalCoin = parseInt(dailySummary[0].dataValues.total_coin);
                  totalExperience = parseInt(
                    dailySummary[0].dataValues.total_experience,
                  );
                  totalEssence = parseInt(
                    dailySummary[0].dataValues.total_essence,
                  );
                  totalEnergy = parseInt(
                    dailySummary[0].dataValues.total_energy,
                  );
                }
                totalCoin += parseInt(coin);
                totalExperience += parseInt(experience);
                totalEssence += parseInt(essence);
                totalEnergy += parseInt(energy);
                const rewardsEmbeds = {
                  name: "Rewards",
                  value: `Coin: ${coin.toLocaleString()}, Experience: ${experience.toLocaleString()}, Essence: ${essence.toLocaleString()}, Energy: ${energy.toLocaleString()}`,
                };

                const totalRewardsEmbeds = {
                  name: "Total Rewards",
                  value: `Coin: ${totalCoin.toLocaleString()}, Experience: ${totalExperience.toLocaleString()}, Essence: ${totalEssence.toLocaleString()}, Energy: ${totalEnergy.toLocaleString()}`,
                };

                await models.LovHistory.create({
                  experience,
                  coin,
                  essence,
                  energy,
                  createdAtServer,
                  lovAddressId: id,
                });
                const channel =
                  tier === 1
                    ? tier1Channel
                    : tier === 2
                    ? tier2Channel
                    : tier3Channel;
                channel.send({
                  embeds: [
                    {
                      color: 0x0099ff,
                      title: name,
                      description: `Location: ${location}`,
                      thumbnail: {
                        url: _data.venari.assets.avatar,
                      },
                      fields: [
                        {
                          name: "Name",
                          value: _data.venari.name,
                        },
                        {
                          name: "Caught",
                          value: caught ? "Yes" : "NO",
                        },
                        rewardsEmbeds,
                        totalRewardsEmbeds,
                        {
                          name: "Type",
                          value: type,
                        },
                      ],
                      timestamp: new Date(),
                      footer: {
                        text: `created At: ${moment.unix(
                          Date.parse(createdAtServer),
                        )}`,
                        // icon_url: "botUrl",
                      },
                    },
                  ],
                });
              }
            }
          } catch (error) {
            console.log("api error");
            console.log(error);
          }
        });
      }, process.env.COOL_DOWN_TIME);
      message.reply("start lov is running");
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
