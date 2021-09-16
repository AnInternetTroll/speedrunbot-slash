import { DISCORD_URL } from "../../../utils.ts";
import { client } from "../../../deps_harmony.ts";

export default async (req: Request): Promise<Response> => {
	try {
		const { code } = await req.json();
		const body = new URLSearchParams({
			client_id: client.getID(),
			client_secret: Deno.env.get("CLIENT_SECRET")!,
			grant_type: "authorization_code",
			code,
		});
		const res = await fetch(`${DISCORD_URL}/oauth2/token`, {
			headers: {
				"Conent-Type": "application/x-www-form-urlencoded",
			},
			body: body.toString(),
		});
		return new Response(res.body);
	} catch (err) {
		console.log(err);
		return new Response(
			JSON.stringify({ code: 400, message: "Invalid request" }),
		);
	}
};
