import { HandlerContext, InteractionsClient } from "../../../deps_server.ts";
import { SpeedrunCom } from "../../../srcom/slash_commands.ts";

export const client = new InteractionsClient({
	token: Deno.env.get("TOKEN"),
	publicKey: Deno.env.get("PUBLIC_KEY"),
});

client.loadModule(new SpeedrunCom());

export const handler = {
	POST(ctx: HandlerContext): Promise<Response> {
		const req = ctx.req;
		// deno-lint-ignore no-async-promise-executor
		return new Promise(async (res) => {
			const interaction = await client.verifyFetchEvent({
				respondWith: res,
				request: req,
			});
			if (interaction === false) {
				return res(new Response(null, { status: 401 }));
			}
			if (interaction.type === 1) return interaction.respond({ type: 1 });
			await client._process(interaction);
		});
	},
};
