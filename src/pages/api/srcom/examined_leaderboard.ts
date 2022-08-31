import { examinedLeaderboard } from "../../../srcom/examined_leaderboard.ts";
import { isMarkupType } from "../../../srcom/fmt.ts";
import { statuses } from "../../../srcom/utils.ts";
import { ApiError, apiResponse } from "../../../utils.ts";

export default async function (req: Request): Promise<Response> {
	if (req.method === "GET") {
		const { searchParams } = new URL(req.url);
		const {
			game = undefined,
			status = undefined,
			outputType = "plain",
		} = Object.fromEntries(searchParams.entries());

		if (!game) {
			throw new ApiError("No game query parameter found", {
				status: 400,
			});
		}

		if (status && !statuses.includes(status)) {
			throw new ApiError(
				`Invalid status provided. The only valid status values are ${
					statuses.join(", ")
				}`,
				{
					status: 400,
				},
			);
		}

		if (!isMarkupType(outputType)) {
			throw new ApiError("Unexpected outputType", {
				status: 400,
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
			status: 400,
		});
	}
}
