import { defaultLanguage } from "../constants.ts";
import { requests } from "../utils/mod.ts";
import type { Options } from "../utils/mod.ts";
import { GetUserLeaderboardParams } from "./GetUserLeaderboardParams.ts";
import { GetUserLeaderboardResponse } from "./GetUserLeaderboardResponse.ts";

const path = "/GetUserLeaderboard";

export const GetUserLeaderboard = (
	params: GetUserLeaderboardParams,
	options: Options = { language: defaultLanguage },
): Promise<GetUserLeaderboardResponse> =>
	requests(
		path,
		{ params, ...options },
	) as Promise<GetUserLeaderboardResponse>;
