import { STATUS_CODE } from "../../../../deps_server.ts";
import { client } from "../../../client.ts";

export default (req: Request): Promise<Response> | Response => {
	if (req.method !== "POST") {
		return Response.json({
			message: "Bad method",
		}, {
			status: STATUS_CODE.NotFound,
		});
	}
	// deno-lint-ignore no-async-promise-executor
	return new Promise(async (res) => {
		const interaction = await client.verifyFetchEvent({
			respondWith: res,
			request: req,
		});
		if (interaction === false) {
			return res(new Response(null, { status: STATUS_CODE.Unauthorized }));
		}
		if (interaction.type === 1) return interaction.respond({ type: 1 });
		await client._process(interaction);
	});
};
