import {
	ApplicationCommandInteraction,
	AutocompleteInteraction,
	Channel,
	Client,
	decodeText,
	Guild,
	GuildPayload,
	HandlerContext,
	Interaction,
	InteractionApplicationCommandData,
	InteractionApplicationCommandResolved,
	InteractionChannel,
	InteractionPayload,
	InteractionsClient,
	InteractionType,
	Member,
	Message,
	MessageComponentInteraction,
	Role,
	TextChannel,
	User,
} from "../../../deps_server.ts";
import { SpeedrunCom } from "../../../srcom/slash_commands.ts";

export const client = new InteractionsClient({
	token: Deno.env.get("TOKEN"),
	publicKey: Deno.env.get("PUBLIC_KEY"),
});

const bad = new Response(null, { status: 400 });

client.loadModule(new SpeedrunCom());

export const handler = {
	async POST(ctx: HandlerContext): Promise<Response> {
		const req = ctx.req;
		try {
			if (req.bodyUsed === true) throw new Error("Request Body already used");
			if (req.body === null) return bad;
			const rawbody = (await req.body.getReader().read()).value;
			if (rawbody === undefined) return bad;

			if (req.method.toLowerCase() !== "post") return bad;

			const signature = req.headers.get("x-signature-ed25519");
			const timestamp = req.headers.get("x-signature-timestamp");
			if (signature === null || timestamp === null) return bad;

			const verify = await client.verifyKey(rawbody, signature, timestamp);
			if (!verify) return bad;

			try {
				const payload: InteractionPayload = JSON.parse(decodeText(rawbody));

				// Note: there's a lot of hacks going on here.

				const clientScoped = client as unknown as Client;

				let res;

				const channel = payload.channel_id !== undefined
					? (new Channel(clientScoped, {
						id: payload.channel_id!,
						type: 0,
					}) as unknown as TextChannel)
					: undefined;

				const user = new User(
					clientScoped,
					(payload.member?.user ?? payload.user)!,
				);

				const guild = payload.guild_id !== undefined
					? // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
						new Guild(clientScoped, {
							id: payload.guild_id!,
							unavailable: true,
						} as GuildPayload)
					: undefined;

				const member = payload.member !== undefined
					? // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
						new Member(clientScoped, payload.member, user, guild!)
					: undefined;

				if (
					payload.type === InteractionType.APPLICATION_COMMAND ||
					payload.type === InteractionType.AUTOCOMPLETE
				) {
					const resolved: InteractionApplicationCommandResolved = {
						users: {},
						members: {},
						roles: {},
						channels: {},
						messages: {},
					};

					for (
						const [id, data] of Object.entries(
							// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
							(payload.data as InteractionApplicationCommandData).resolved
								?.users ??
								{},
						)
					) {
						resolved.users[id] = new User(clientScoped, data);
					}

					for (
						const [id, data] of Object.entries(
							// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
							(payload.data as InteractionApplicationCommandData).resolved
								?.members ?? {},
						)
					) {
						resolved.members[id] = new Member(
							clientScoped,
							data,
							resolved.users[id],
							undefined as unknown as Guild,
						);
					}

					for (
						const [id, data] of Object.entries(
							// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
							(payload.data as InteractionApplicationCommandData).resolved
								?.roles ??
								{},
						)
					) {
						resolved.roles[id] = new Role(
							clientScoped,
							data,
							undefined as unknown as Guild,
						);
					}

					for (
						const [id, data] of Object.entries(
							// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
							(payload.data as InteractionApplicationCommandData).resolved
								?.channels ?? {},
						)
					) {
						resolved.channels[id] = new InteractionChannel(clientScoped, data);
					}

					for (
						const [id, data] of Object.entries(
							// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
							(payload.data as InteractionApplicationCommandData).resolved
								?.messages ?? {},
						)
					) {
						resolved.messages[id] = new Message(
							clientScoped,
							data,
							data.channel_id as unknown as TextChannel,
							new User(clientScoped, data.author),
						);
					}

					res = payload.type === InteractionType.APPLICATION_COMMAND
						? new ApplicationCommandInteraction(clientScoped, payload, {
							user,
							member,
							guild,
							channel,
							resolved,
						})
						: new AutocompleteInteraction(clientScoped, payload, {
							user,
							member,
							guild,
							channel,
							resolved,
						});
				} else if (payload.type === InteractionType.MESSAGE_COMPONENT) {
					res = new MessageComponentInteraction(clientScoped, payload, {
						channel,
						guild,
						member,
						user,
						message: new Message(
							clientScoped,
							payload.message!,
							payload.message!.channel_id as unknown as TextChannel,
							new User(clientScoped, payload.message!.author),
						),
					});
				} else {
					res = new Interaction(clientScoped, payload, {
						user,
						member,
						guild,
						channel,
					});
				}

				return new Response(
					res instanceof FormData ? res : JSON.stringify(res),
					{
						status: 200,
						headers: new Headers({
							"content-type": res instanceof FormData
								? "multipart/form-data"
								: "application/json",
						}),
					},
				);
			} catch (e) {
				await client.emit("interactionError", e as Error);
				return bad;
			}
		} catch (e) {
			await client.emit("interactionError", e as Error);
			return new Response(e, {
				status: 500,
			});
		}
	},
};
