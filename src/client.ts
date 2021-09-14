#!/usr/bin/env -S deno run --allow-net=www.speedrun.com,gateway.discord.gg,discord.com --allow-env --allow-read=. --no-check
import {
  ApplicationCommandInteraction,
  Client,
  Embed,
  event,
  Intents,
  slash,
} from "https://deno.land/x/harmony@v2.1.3/mod.ts";
import { commands } from "./srcom/slashCommands.ts";

import "https://deno.land/x/dot_env@0.2.0/load.ts";

import { games } from "./srcom/games.ts";

export class SpeedRunBot extends Client {
  @event()
  ready() {
    console.log("Started!");
    this.register();
  }

  register() {
    commands.forEach((command) => {
      this.interactions.commands.create(command, Deno.env.get("TEST_SERVER"))
        .then((cmd) => console.log(`Created Slash Command ${cmd.name}!`))
        .catch((cmd) =>
          console.log(`Failed to create ${Deno.inspect(cmd)} command!`)
        );
    });
  }

  @slash()
  async games(i: ApplicationCommandInteraction) {
    const [username] = i.options.map((opt) => opt.value);
    const [title, ...content] =
      (await games(username, { outputType: "markdown" })).split("\n");

    const embed = new Embed({
      title: title,
      description: content.join("\n"),
    });
    await i.reply({ embeds: [embed] });
  }
}

if (import.meta.main) {
 const client = new SpeedRunBot({
    intents: Intents.None,
    token: Deno.env.get("TOKEN"),
  });
  client.connect();
}
