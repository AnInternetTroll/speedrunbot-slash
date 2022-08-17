import { examinedLeaderboard } from "../../../srcom/examined_leaderboard.ts";
import { isMarkupType } from "../../../srcom/fmt.ts";
import { ApiError, apiResponse } from "../../../utils.ts";

export default async function (req: Request): Promise<Response> {
	if (req.method === "GET") {
		const { searchParams } = new URL(req.url);
		const {
			games = undefined,
			outputType = "plain",
		} = Object.fromEntries(searchParams.entries());

		if (!games) {
			throw new ApiError("No games query parameter found");
		}

		if (!isMarkupType(outputType)) {
			throw new ApiError("Unexpected outputType", {
				status: 400,
			});
		}

		const output = await examinedLeaderboard(
			games.split(" ").map((game) => game.split(",")).flat(),
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
