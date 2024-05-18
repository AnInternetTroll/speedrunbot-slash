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
preferred abbreviation of the site, such as `srcom` or `mkr` or `halo`.

It is strongly preferred that commands can be executed outside of the context of
a discord bot, such as `./src/srcom/whois.ts aninternettroll`.

It is strongly preferred that commands don't use any `Deno` APIs, as most
commands could be executed in the context of a browser. An exception to this can
be if the `Deno` API works on [Deno Deploy](https://deno.com/deploy) as well.

# Running the code

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
deno task dev
# Or if on unix
./mod.ts
```

The permissions required are as follows:

- allow-read
  - Used to read the `.env` file, as well as deno's cache for some wasm modules
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
deno task fmt
# Or
deno fmt --config deno.jsonc ./
```

# Linting rules

Just the default linting rules of `deno lint`

```sh
deno task lint
# Or
deno lint .
```

# Testing

Before pushing your code it is recommended to test it to see if everything is
all right. There are a couple of tasks for this

## Formatting

```sh
deno task fmt --check
# Or
deno fmt --check
```

## Linting

```sh
deno task lint
# Or
deno lint .
```

## Type checking

```sh
deno task check
# Or
deno check main.ts
```

## Tests

```sh
deno test --allow-net
```

## Ci

This is the command ran on the CI pipeline for every PR and push action

```sh
deno task ci
```
