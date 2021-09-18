/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { client } from "./pages/api/discord/interactions.ts";
import { SpeedrunCom } from "./srcom/slashCommands.ts";
import "https://deno.land/x/dot_env@0.2.0/load.ts";

import { start } from "https://raw.githubusercontent.com/lucacasonato/fresh/main/server.ts";
import routes from "./routes.gen.ts";

start(routes);

client.loadModule(new SpeedrunCom());
