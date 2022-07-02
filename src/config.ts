import { config as dotenvConfig } from "../deps_server.ts";

export const config = await dotenvConfig({
	export: false,
	// @ts-ignore This can be false trust me dude
	defaults: false,
});
