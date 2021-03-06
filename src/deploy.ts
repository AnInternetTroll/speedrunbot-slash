/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { client } from "./pages/api/discord/interactions.ts";
import { SpeedrunCom } from "./srcom/slash_commands.ts";

import routes from "./routes.gen.ts";
import { start } from "../deps_server.ts";

start(routes);

client.loadModule(new SpeedrunCom());
