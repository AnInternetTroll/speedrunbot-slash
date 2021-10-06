#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read=. --no-check
import { SpeedRunBot } from "./client.ts";
import { start } from "./deps_server.ts";
import { client } from "./pages/api/discord/interactions.ts";
import routes from "./routes.gen.ts";
import { SpeedrunCom } from "./srcom/slash_commands.ts";

if (import.meta.main) {
  if (!("DENO_DEPLOYMENT_ID" in Deno.env.toObject())) {
    const client = new SpeedRunBot({
      intents: [],
      token: Deno.env.get("TOKEN"),
    });
    client.connect();
  }
  start(routes);
  client.loadModule(new SpeedrunCom());
}
