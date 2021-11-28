import {
	HandlerContext,
	InteractionResponseType,
	InteractionsClient,
	InteractionType,
} from "../../../deps_server.ts";
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
		return new Promise(async (res, rej) => {
			try {
				const interaction = await client.verifyFetchEvent({
					respondWith: res,
					request: req,
				});
				if (interaction === false) {
					return res(new Response("Not Authorized", { status: 400 }));
				}
				if (interaction.type === InteractionType.PING) {
					client.emit("ping");
					return interaction.respond({ type: InteractionResponseType.PONG });
				}
				await client._process(interaction);
			} catch (e) {
				await client.emit("interactionError", e as Error);
				rej(
					new Response(e, {
						status: 500,
					}),
				);
			}
		});
	},
};
