import { Client, event, Interaction } from "../deps_server.ts";
import { SpeedrunCom } from "./srcom/slash_commands.tsx";

export class SpeedRunBot extends Client {

	@event("interactionCreate")
	handleCancelButton(e: Interaction) {
		if (e.isMessageComponent()) {
			SpeedrunCom.handleCancelButton(e);
		}
	}

	@event()
	ready() {
		this.interactions.loadModule(new SpeedrunCom());
	}
}
