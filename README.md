# discord-manager-bot

This bot is create to manage scholarship and track venari catch in [Legends of venari](https://legendsofvenari.com/)

## Command

### User manage

- adduser
- removeuser
- changerole

### Fetch

- addchannel

### Lov Address manage

- addlovaddress
- removelovaddress
- updateLovaddresssummary

### summary

- summary

### Start Bot

- startLov

## Environment file

```
NODE_ENV=on development 'development', on production 'production'
DISCORD_BOT_TOKEN=xxx
DB_HOST=x.x.x.x
DB_USER=xx
DB_PASSWORD=xxx
DB_NAME=xxx
GUILD_IDA=xxx
DB_PORT=xxx
```

# To Run Bot

### Install dependent

```
npm i
```

## Database migration

```
npx sequelize db:migrate
```

### Run Bot on development environment

```
npm run dev
```
