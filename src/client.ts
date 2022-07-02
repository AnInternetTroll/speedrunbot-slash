import { SpeedrunCom } from "./srcom/slash_commands.ts";
import { InteractionsClient } from "../deps_server.ts";
import { config } from "./config.ts";

export const client = new InteractionsClient({
	token: config.TOKEN,
	publicKey: config.PUBLIC_KEY,
});

client.loadModule(new SpeedrunCom());
