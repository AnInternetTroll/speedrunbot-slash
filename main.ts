#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read --allow-write --allow-run --no-check
import { SpeedRunBot } from "./src/client.ts";
import { start } from "./deps_server.ts";
import { client } from "./src/pages/api/discord/interactions.ts";
import routes from "./src/routes.gen.ts";
import { SpeedrunCom } from "./src/srcom/slash_commands.ts";

if (import.meta.main) {
	if (!Deno.env.get("DENO_DEPLOYMENT_ID")) {
		const client = new SpeedRunBot({
			intents: [],
			token: Deno.env.get("TOKEN"),
		});
		client.connect();
	}
	start(routes);
	client.loadModule(new SpeedrunCom());
}
