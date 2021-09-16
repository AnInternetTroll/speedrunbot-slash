// deno-lint-ignore-file no-unreachable no-explicit-any
import {
	ApplicationCommandInteraction,
	client,
	InteractionType,
} from "../../../deps_harmony.ts";
import {
	Interaction,
	InteractionApplicationCommandResolved,
	InteractionPayload,
	InteractionResponseType,
	User,
} from "https://deno.land/x/harmony@v2.1.3/mod.ts";
import { decodeText } from "https://deno.land/x/harmony@v2.1.3/src/utils/encoding.ts";
import {
	readAll,
	readerFromStreamReader,
} from "https://deno.land/std@0.107.0/io/mod.ts";

export default async (req: Request): Promise<Response> => {
	const bad = new Response(
		JSON.stringify({ code: 400, message: "Bad request " }),
		{
			status: 400,
		},
	);
	try {
		if (req.bodyUsed === true) throw new Error("Request Body already used");
		if (req.body === null) return bad;
		const body = (await req.body.getReader().read()).value;
		if (body === undefined) return bad;

		// we have to wrap because there are some weird scope errors
		if (req.method.toLowerCase() !== "post") return bad;

		const signature = req.headers.get("x-signature-ed25519");
		const timestamp = req.headers.get("x-signature-timestamp");
		if (signature === null || timestamp === null) return bad;

		const rawbody = req.body instanceof Uint8Array
			? req.body
			: await readAll(readerFromStreamReader(req.body.getReader()));
		const verify = await client.verifyKey(rawbody, signature, timestamp);
		if (!verify) return bad;

		let res: ApplicationCommandInteraction | Interaction;
		try {
			const payload: InteractionPayload = JSON.parse(decodeText(rawbody));

			// TODO: Maybe fix all this hackery going on here?
			if (payload.type === InteractionType.APPLICATION_COMMAND) {
				res = new ApplicationCommandInteraction(this as any, payload, {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					user: new User(this as any, (payload.member?.user ?? payload.user)!),
					member: payload.member as any,
					guild: payload.guild_id as any,
					channel: payload.channel_id as any,
					resolved: ((payload.data as any)
						?.resolved as unknown as InteractionApplicationCommandResolved) ?? {
						users: {},
						members: {},
						roles: {},
						channels: {},
					},
				});
			} else {
				res = new Interaction(this as any, payload, {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					user: new User(this as any, (payload.member?.user ?? payload.user)!),
					member: payload.member as any,
					guild: payload.guild_id as any,
					channel: payload.channel_id as any,
				});
			}
			await client.emit("interaction", res);
			return new Response(res instanceof FormData ? res : JSON.stringify(res), {
				status: 200,
				headers: new Headers({
					"content-type": res instanceof FormData
						? "multipart/form-data"
						: "application/json",
				}),
			});
		} catch (e) {
			console.log(e);
			return bad;
		}

		if (res.type === InteractionType.PING) {
			await res.respond({ type: InteractionResponseType.PONG });
			client.emit("ping");
			return bad;
		}

		await (client as any)._process(res);
	} catch (e) {
		await client.emit("interactionError", e);
		return bad;
	}
};
