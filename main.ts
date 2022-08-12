#!/usr/bin/env -S deno run --allow-net --allow-read=.env --no-check --watch
import { serve } from "./deps_server.ts";
import { config } from "./src/config.ts";
import { handler } from "./src/pages/mod.tsx";
import { commands } from "./src/srcom/slash_commands.tsx";
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
		console.log("Editting commands...");
		await client.interactions.commands.bulkEdit(
			commands,
			config.TEST_SERVER,
		);

		console.log("Editted!");

		if (Deno.args.includes("--update") || Deno.args.includes("-u")) {
			console.log("Goodbye!");
			await client.close();
			Deno.exit(0);
		}
	}
	if ((await Deno.permissions.query({ name: "net" })).state === "granted") {
		serve(handler);
	} else console.warn("Webserver is NOT running!");
}
