// deno-lint-ignore-file camelcase
import { HandlerContext } from "../../../../deps_server.ts";
import { DISCORD_URL } from "../../../utils.ts";
import { client } from "./interactions.ts";

export interface Token {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	token_type: string;
	scope: string;
}

export const handler = {
	async POST(ctx: HandlerContext): Promise<Response> {
		const req = ctx.req;
		const { code, redirect_uri } = await req.json();
		const body = new URLSearchParams({
			client_id: client.getID(),
			client_secret: Deno.env.get("CLIENT_SECRET")!,
			grant_type: "authorization_code",
			redirect_uri,
			code,
		});

		const res = await fetch(`${DISCORD_URL}/oauth2/token`, {
			method: "POST",
			body: body.toString(),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});
		const resData = await res.json() as Token;
		return new Response(
			JSON.stringify(resData),
			{
				status: res.status,
				statusText: res.statusText,
			},
		);
	},
};
