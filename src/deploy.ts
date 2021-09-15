import { client, init } from "https://deno.land/x/harmony@v2.1.3/deploy.ts";

import { SpeedrunCom } from "./srcom/slashCommands.ts";

init({ env: true, path: "/discord/interactions" });

client.loadModule(new SpeedrunCom());
