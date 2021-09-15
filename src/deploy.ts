import { client, init } from "https://deno.land/x/harmony@v2.1.3/deploy.ts";

import { SpeedrunCom } from "./srcom/slashCommands.ts";

init({ env: true });

client.loadModule(new SpeedrunCom());
