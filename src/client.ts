#!/usr/bin/env -S deno run --allow-net=www.speedrun.com,gateway.discord.gg,discord.com --allow-env --allow-read=. --no-check
import { commands } from "./srcom/slashCommands.ts";

import "https://deno.land/x/dot_env@0.2.0/load.ts";

import { SpeedrunCom } from "./srcom/slashCommands.ts";
import { Client, event, Intents } from "./deps_harmony.ts";

export class SpeedRunBot extends Client {
	@event()
	ready() {
		console.log("Started!");
		this.interactions.loadModule(new SpeedrunCom());
		// this.deleteCommands(Deno.env.get("TEST_SERVER"));
		//this.register();
	}

	register() {
		commands.forEach((command) => {
			this.interactions.commands.create(command, Deno.env.get("TEST_SERVER"))
				.then((cmd) => console.log(`Created Slash Command ${cmd.name}!`))
				.catch((cmd) => console.log(Deno.inspect(cmd)));
		});
	}

	async deleteCommands(guild?: string) {
		const cmds = await this.interactions.commands.all();
		cmds.forEach((cmd) => {
			this.interactions.commands.delete(cmd.id, guild);
		});
	}
}

if (import.meta.main) {
	const client = new SpeedRunBot({
		intents: Intents.NonPrivileged,
		token: Deno.env.get("TOKEN"),
	});
	client.connect();
}
