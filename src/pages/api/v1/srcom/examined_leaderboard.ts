import { ApiError, apiResponse } from "../../../../utils.ts";
import { examinedLeaderboard } from "../../../../srcom/examined_leaderboard.ts";
import {
	isMarkupType,
	MarkupType,
	stringToMarkup,
} from "../../../../srcom/fmt.ts";
import { statuses } from "../../../../srcom/utils.ts";
import { Status } from "../../../../../deps_server.ts";

export default async function (req: Request): Promise<Response> {
	let game: string | undefined,
		status: string | undefined,
		outputType = MarkupType.Plain;

	if (req.method === "GET") {
		const { searchParams } = new URL(req.url);
		game = searchParams.get("game") || undefined;
		status = searchParams.get("status") || undefined;
		outputType = stringToMarkup(searchParams.get("output-type")) ||
			MarkupType.Plain;

		if (!game) {
			throw new ApiError("No game query parameter found", {
				status: Status.BadRequest,
			});
		}

		if (status && !Object.keys(statuses).includes(status)) {
			throw new ApiError(
				`Invalid status provided. The only valid status values are ${
					Object.keys(statuses).join(", ")
				}`,
				{
					status: Status.BadRequest,
				},
			);
		}

		if (!isMarkupType(outputType)) {
			throw new ApiError("Unexpected output-type", {
				status: Status.BadRequest,
			});
		}

		const output = await examinedLeaderboard(
			game,
			status,
			{
				outputType,
			},
		);

		return apiResponse(output);
	} else {
		throw new ApiError("Only GET requests are allowed", {
			status: Status.BadRequest,
		});
	}
}
