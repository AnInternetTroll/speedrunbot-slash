import { client } from "./interactions.ts";
import { DISCORD_URL } from "../../../utils.ts";
import { commands } from "../../../srcom/slash_commands.ts";

interface ReqBody {
	// deno-lint-ignore camelcase
	access_token: string;
}

const bad = new Response(
	JSON.stringify({
		code: 400,
		message: "Bad request",
	}),
	{
		status: 400,
	},
);

export default async (req: Request): Promise<Response> => {
	const admin = await isAdmin(req);
	if (admin) {
		await client.commands.bulkEdit(commands);
		return new Response(JSON.stringify({
			code: 200,
			message: "Updated commands",
		}));
	} else {
		return new Response(
			JSON.stringify({
				code: 403,
				message: "You are not this bot's owner",
			}),
			{
				status: 403,
			},
		);
	}
};

async function isAdmin(input: string | Request): Promise<boolean> {
	// deno-lint-ignore camelcase
	let access_token: string;
	if (input instanceof Request) {
		if (input.method !== "POST") {
			throw bad;
		}
		if (!input.headers.get("content-type")?.includes("json")) throw bad;
		const data = await input.json() as ReqBody;
		if (!("access_token" in data)) throw bad;
		access_token = data.access_token;
	} else access_token = input;

	const userReq = await fetch(`${DISCORD_URL}/users/@me`, {
		headers: {
			"authorization": `Bearer ${access_token}`,
		},
	});
	const user = await userReq.json();
	const applicationInfo = await client.fetchApplication();
	return (applicationInfo.team?.members.includes(user.id) ||
		applicationInfo.owner?.id === user.id);
}
