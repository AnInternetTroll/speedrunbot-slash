/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { client, init } from "./deps_harmony.ts";
import { SpeedrunCom } from "./srcom/slashCommands.ts";

// Disabling the frontend
// How do I use this with harmony???
import { start } from "https://raw.githubusercontent.com/lucacasonato/fresh/main/server.ts";
import routes from "./routes.gen.ts";
start(routes);

init({ env: true, path: "/discord/interactions" });
client.loadModule(new SpeedrunCom());
