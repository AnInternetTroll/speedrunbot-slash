# Setup

```sh
. # General files, not code.
├── README.md
└── src # Where all the code goes
	├── client.ts # Discord bot
	├── deploy.ts # Deno deploy file
	└── srcom # Where speedrun.com commands go
		├── slash_commands.ts # Commands definitons and a `ApplicationCommandsModule` to be loaded by `client.ts` or `deploy.ts`
		├── types.d.ts # Types of the REST API of speedrun.com
		├── utils.ts # General utilities, such as `SRC_API` or functions used in other commands
```

If you want to add a new website support just make a new folder in `src` with a
prefered abbreviation of the site, such as `srcom` or `mkr` or `halo`.

It is strongly prefered that commands can be executed outside of the context of
a discord bot, such as `./src/srcom/whois.ts aninternettroll`.

It is strongly prefered that commands don't use any `Deno` APIs, as most
commands could be executed in the context of a browser. An exception to this can
be if the `Deno` API works on [Deno Deploy](https://deno.com/deploy) as well.

# Running the code

Join the Discord server: https://discord.gg/dvCAhEC2e5

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
deno run --allow-net=www.speedrun.com,gateway.discord.gg,discord.com --allow-env --allow-read=. ./mod.ts
# Or if on unix
./mod.ts
```

The permissions required are as follows:

- allow-read
  - . (to read the `.env` file)
- allow-env (to read `TOKEN` and `TEST_SERVER`)
- allow-net
  - www.speedrun.com (for the speedrun.com api)
  - gateway.discord.gg (for websocket connection to Discord)
  - discord.gg (for sending messages to Discord)

# Code Styles

This project uses the formatting rules used by default by `deno fmt` with the
exception of tabs instead of spaces. To format your code accordingly you can run
the following command:

```sh
deno fmt --config deno.jsonc ./
```

# Linting rules

Just the default linting rules of `deno lint`

```sh
deno lint .
```
