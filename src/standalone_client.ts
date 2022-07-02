import { Client, event } from "../deps_server.ts";
import { SpeedrunCom } from "./srcom/slash_commands.ts";

export class SpeedRunBot extends Client {
	@event()
	ready() {
		this.interactions.loadModule(new SpeedrunCom());
	}
}
