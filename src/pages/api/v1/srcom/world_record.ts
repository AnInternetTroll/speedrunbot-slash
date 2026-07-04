import { ApiError, apiResponse } from "../../../../utils.ts";
import { worldRecord } from "../../../../srcom/world_record.ts";
import {
	isMarkupType,
	MarkupType,
	stringToMarkup,
} from "../../../../srcom/fmt.ts";
import { STATUS_CODE } from "../../../../../deps_server.ts";

export default async function (req: Request): Promise<Response> {
	let game: string | undefined,
		category: string | undefined,
		subcategory: string | undefined,
		outputType = MarkupType.Plain;

	if (req.method === "GET") {
		const { searchParams } = new URL(req.url);
		game = searchParams.get("game") || undefined;
		category = searchParams.get("category") || undefined;
		subcategory = searchParams.get("subcategory") || undefined;
		outputType = stringToMarkup(searchParams.get("output-type")) ||
			MarkupType.Plain;

		if (!game) {
			throw new ApiError("No game query parameter found", {
				status: STATUS_CODE.BadRequest,
			});
		}

		if (!isMarkupType(outputType)) {
			throw new ApiError("Unexpected output-type", {
				status: STATUS_CODE.BadRequest,
			});
		}

		const output = await worldRecord(
			game,
			category,
			subcategory,
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
