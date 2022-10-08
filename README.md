# SpeedrunBot-Slash

A speedrun bot but using slash commands instead of traditional commands.

# Why

In April 2022 bots in over 100 servers will not be able to read messages
anymore. This means that bots will **have** to use slash commands instead. Slash
commands are not anybody's favourite, but they're here and we might as well use
them to the best of our abilities. As such this bot is meant to run on
[Deno Deploy](https://deno.com/deploy). A serverless environment where discord
tells deno deploy what command it wants and deno deploy responds.

# Development

Join the Discord server: https://discord.gg/P4FbDQywua

Before running the bot you must first make a `.env` file in the root of the
project and put in the following

```sh
TOKEN="YOUR BOT'S DISCORD TOKEN"
TEST_SERVER="12345" # Optional discord guild/server ID
# For the website part
CLIENT_SECRET="abcd"
PUBLIC_KEY="abcd"
```

To run the discord bot development mode use the following command

```sh
# Unstable tasks
deno task dev
```

For more info read [CONTRIBUTING.md](CONTRIBUTING.md)

# Production

```sh
# Unstable tasks
deno task start
# If you don't want to give too many permissions
# Otherwise --allow.net by itself is enough
deno run --allow-net=www.speedrun.com,gateway.discord.gg,discord.com --allow-read=.env ./main.ts
# Or if on unix
./main.ts
```

# Credits

Shoutout to those 2 projects who've done great work on their discord bots:

- [Mango Man](https://github.com/Mango0x45/speedrunbot-plusplus)
- [Slush0Puppy](https://github.com/Slush0Puppy/speedrunbot)
