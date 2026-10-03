import { defaultLanguage } from "../constants.ts";
import { requests } from "../utils/mod.ts";
import type { Options } from "../utils/mod.ts";
import type { GetGameLeaderboard2Params } from "./GetGameLeaderboard2Params.ts";
import type { GetGameLeaderboard2Response } from "./GetGameLeaderboard2Response.ts";

const path = "/GetGameLeaderboard2";

export const GetGameLeaderboard2 = (
	params: GetGameLeaderboard2Params,
	options: Options = { language: defaultLanguage },
): Promise<GetGameLeaderboard2Response> =>
	requests(
		path,
		{ params, ...options },
	) as Promise<GetGameLeaderboard2Response>;
