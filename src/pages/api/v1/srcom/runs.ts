import { ApiError, apiResponse } from "../../../../utils.ts";
import { runs } from "../../../../srcom/runs.ts";
import {
	isMarkupType,
	MarkupType,
	stringToMarkup,
} from "../../../../srcom/fmt.ts";
import { STATUS_CODE } from "../../../../../deps_server.ts";

export default async function (req: Request): Promise<Response> {
	let game: string | undefined,
		user: string | undefined,
		status: string | undefined,
		examiner: string | undefined,
		emulated: string | undefined,
		outputType = MarkupType.Plain;

	if (req.method === "GET") {
		const { searchParams } = new URL(req.url);
		game = searchParams.get("game") || undefined;
		user = searchParams.get("user") || undefined;
		status = searchParams.get("status") || undefined;
		emulated = searchParams.get("emulated") || undefined;
		outputType = stringToMarkup(searchParams.get("output-type")) ||
			MarkupType.Plain;

		if (!isMarkupType(outputType)) {
			throw new ApiError("Unexpected output-type", {
				status: STATUS_CODE.BadRequest,
			});
		}

		const output = await runs(
			user,
			game,
			status,
			examiner,
			emulated,
			{
				outputType,
			},
		);

		return apiResponse(output);
	} else {
		throw new ApiError("Only GET requests are allowed", {
			status: STATUS_CODE.BadRequest,
		});
	}
}
