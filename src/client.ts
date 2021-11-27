#!/usr/bin/env -S deno run --allow-net=www.speedrun.com,gateway.discord.gg,discord.com --allow-env --allow-read=. --no-check
import { commands, SpeedrunCom } from "./srcom/slash_commands.ts";
import { Client, event } from "./deps_server.ts";
import { parse } from "./deps_general.ts";

export class SpeedRunBot extends Client {
	@event()
	ready() {
		console.log("Started!");
		this.interactions.loadModule(new SpeedrunCom());
	}
}

if (import.meta.main) {
	const client = new SpeedRunBot({
		intents: [],
		token: Deno.env.get("TOKEN"),
	});
	await client.connect();
	await client.interactions.commands.bulkEdit(
		commands,
		Deno.env.get("TEST_SERVER"),
	);
	const args = parse(Deno.args);
	if (args.update || args.u) {
		await client.close();
		Deno.exit(0);
	}
}
