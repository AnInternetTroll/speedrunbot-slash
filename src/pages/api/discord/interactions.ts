import { HandlerContext, InteractionsClient } from "../../../deps_server.ts";
import { SpeedrunCom } from "../../../srcom/slash_commands.ts";

export const client = new InteractionsClient({
	token: Deno.env.get("TOKEN"),
	publicKey: Deno.env.get("PUBLIC_KEY"),
});

client.loadModule(new SpeedrunCom());

export const handler = {
	POST(ctx: HandlerContext): Promise<Response> {
		return new Promise((res) =>
			client.verifyFetchEvent({
				respondWith: res,
				request: ctx.req,
			})
		);
	},
};
