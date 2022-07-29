# SpeedrunBot-Slash

A speedrun bot but using slash commands instead of traditional commands.

Join the [Development Discord server](https://discord.gg/dvCAhEC2e5)

# Why

In April 2022 bots in over 100 servers will not be able to read messages
anymore. This means that bots will **have** to use slash commands instead. Slash
commands are not anybody's favourite, but they're here and we might as well use
them to the best of our abilities. As such this bot is meant to run on
[Deno Deploy](https://deno.com/deploy). A serverless environment where discord
tells deno deploy what command it wants and deno deploy responds.

# Development

To run the discord bot development mode use the following command

```sh
deno run --allow-net=www.speedrun.com,gateway.discord.gg,discord.com --allow-env --allow-read=. src/client.ts
# Or if on unix
src/client.ts
```

For more info read [CONTRIBUTING.md](CONTRIBUTING.md)

# Credits

Shoutout to those 2 projects who've done great work on their discord bots:

- [Mango Man](https://github.com/Mango0x45/speedrunbot-plusplus)
- [Slush0Puppy](https://github.com/Slush0Puppy/speedrunbot)
