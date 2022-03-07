// Discord library
export {
	ApplicationCommandInteraction,
	ApplicationCommandsModule,
	autocomplete,
	AutocompleteInteraction,
	Client,
	Embed,
	event,
	InteractionsClient,
	slash,
	SlashCommandOptionType,
} from "https://code.harmony.rocks/08dc7b99089d94d62d6c87bf26e279746dfe418a/mod.ts";
export type {
	ApplicationCommandChoice,
	ApplicationCommandOption,
	SlashCommandPartial,
} from "https://code.harmony.rocks/08dc7b99089d94d62d6c87bf26e279746dfe418a/mod.ts";

// Fresh, the web framework
export { start } from "https://raw.githubusercontent.com/lucacasonato/fresh/d1076b0ad1b420aec689324b3342e543c0d5a591/server.ts";
export type { HandlerContext } from "https://raw.githubusercontent.com/lucacasonato/fresh/d1076b0ad1b420aec689324b3342e543c0d5a591/server.ts";

// Auto load the .env file
// Which contains `TOKEN` and `TEST_SERVER`
import "https://deno.land/x/dotenv@v3.2.0/load.ts";
