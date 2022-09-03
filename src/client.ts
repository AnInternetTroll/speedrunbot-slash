import { SpeedrunCom } from "./srcom/slash_commands.tsx";
import { InteractionsClient, MessageComponentType } from "../deps_server.ts";
import { config } from "./config.ts";
import { General } from "./general/slash_commands.ts";

export const client = new InteractionsClient({
	token: config.TOKEN,
	publicKey: config.PUBLIC_KEY,
});
client.loadModule(new General());
client.loadModule(new SpeedrunCom());

client.on("interaction", (e) => {
	if (e.isMessageComponent()) {
		if (
			e.componentType === MessageComponentType.BUTTON &&
			e.data.custom_id.startsWith("cancel.")
		) {
			SpeedrunCom.handleCancelButton(e);
		}
	}
});
