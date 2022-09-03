import { MessageComponentType } from "https://code.harmony.rocks/c437da5ecd0ec42b81173a7e29ccb1f4e31dad06/mod.ts";
import { Client, event, Interaction } from "../deps_server.ts";
import { General } from "./general/slash_commands.ts";
import { SpeedrunCom } from "./srcom/slash_commands.tsx";

export class SpeedRunBot extends Client {
	@event("interactionCreate")
	handleCancelButton(e: Interaction) {
		if (e.isMessageComponent()) {
			if (
				e.componentType === MessageComponentType.BUTTON &&
				e.data.custom_id.startsWith("cancel.")
			) {
				SpeedrunCom.handleCancelButton(e);
			}
		}
	}

	@event()
	ready() {
		this.interactions.loadModule(new General());
		this.interactions.loadModule(new SpeedrunCom());
	}
}
