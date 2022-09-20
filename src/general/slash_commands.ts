import {
	ApplicationCommandInteraction,
	ApplicationCommandsModule,
	slash,
	SlashCommandPartial,
} from "../../deps_server.ts";

export const commands: SlashCommandPartial[] = [
	{
		name: "ping",
		description: "Mesure the latency between the bot and discord.",
	},
];

export class General extends ApplicationCommandsModule {
	@slash()
	async ping(i: ApplicationCommandInteraction) {
		// https://developer.mozilla.org/en-US/docs/Web/API/Performance/now#examples
		const t1 = performance.now();
		await i.respond({ content: "Pong!" });
		const t2 = performance.now();
		await i.editResponse(`Pong! ${t2 - t1}ms`);
	}
}
