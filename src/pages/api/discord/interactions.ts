// deno-lint-ignore-file no-explicit-any
import {
  ApplicationCommandInteraction,
  decodeText,
  Interaction,
  InteractionApplicationCommandResolved,
  InteractionPayload,
  InteractionResponseType,
  InteractionsClient,
  InteractionType,
  User,
} from "../../../deps_server.ts";
import { SpeedrunCom } from "../../../srcom/slash_commands.ts";

export const client = new InteractionsClient({
  token: Deno.env.get("TOKEN"),
  publicKey: Deno.env.get("PUBLIC_KEY"),
});

client.loadModule(new SpeedrunCom());

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
    const rawbody = (await req.body.getReader().read()).value;
    if (rawbody === undefined) return bad;

    if (req.method.toLowerCase() !== "post") return bad;

    const signature = req.headers.get("x-signature-ed25519");
    const timestamp = req.headers.get("x-signature-timestamp");
    if (signature === null || timestamp === null) return bad;

    const verify = await client.verifyKey(rawbody, signature, timestamp);
    if (!verify) return bad;

    let res: ApplicationCommandInteraction | Interaction;
    try {
      const payload: InteractionPayload = JSON.parse(decodeText(rawbody));
      if (payload.type === InteractionType.APPLICATION_COMMAND) {
        res = new ApplicationCommandInteraction(client as any, payload, {
          user: new User(
            client as any,
            (payload.member?.user ?? payload.user)!,
          ),
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
        res = new Interaction(client as any, payload, {
          user: new User(
            client as any,
            (payload.member?.user ?? payload.user)!,
          ),
          member: payload.member as any,
          guild: payload.guild_id as any,
          channel: payload.channel_id as any,
        });
      }

      if (res.type === InteractionType.PING) {
        await res.respond({ type: InteractionResponseType.PONG });
        client.emit("ping");
        return bad;
      }

      await client.emit("interaction", res);
      await (client as any)._process(res);

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
  } catch (e) {
    console.log(e);
    await client.emit("interactionError", e);
    return bad;
  }
};
