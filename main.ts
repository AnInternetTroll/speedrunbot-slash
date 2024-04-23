#!/usr/bin/env -S deno run --allow-net --allow-read --no-check --watch --location=http://speedrunbot-slash/
import { config } from "./src/config.ts";
import { handler } from "./src/pages/mod.tsx";
import { commands as srcCommands } from "./src/srcom/slash_commands.tsx";
import { commands as generalCommands } from "./src/general/slash_commands.ts";
import { SpeedRunBot } from "./src/standalone_client.ts";
import { isDeployed } from "./src/utils.ts";

if (import.meta.main) {
	if (!isDeployed) {
		const client = new SpeedRunBot({
			intents: [],
			token: config.TOKEN,
		});
		console.log("Connecting...");
		await client.connect();
		console.log("Connected!");
		console.log("Editing commands...");
		await client.interactions.commands.bulkEdit(
			[...srcCommands, ...generalCommands],
			config.TEST_SERVER,
		);

		console.log("Edited!");

		if (Deno.args.includes("--update") || Deno.args.includes("-u")) {
			console.log("Goodbye!");
			await client.destroy();
			Deno.exit(0);
		}
	}
	if ((await Deno.permissions.query({ name: "net" })).state === "granted") {
		Deno.serve(handler);
	} else console.warn("Webserver is NOT running!");
}
