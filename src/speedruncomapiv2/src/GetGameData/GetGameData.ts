import { defaultLanguage } from "../constants.ts";
import { requests } from "../utils/mod.ts";
import type { Options } from "../utils/mod.ts";
import { GetGameDataBody } from "./GetGameDataBody.ts";
import { GetGameDataResponse } from "./GetGameDataResponse.ts";

const path = "/GetGameData";

export const GetGameData = (
	body: GetGameDataBody,
	options: Options = { language: defaultLanguage },
): Promise<GetGameDataResponse> =>
	requests(
		path,
		{ body, method: "POST", ...options },
	) as Promise<GetGameDataResponse>;

// This also works???
// export const GetGameData = (
// 	params: GetGameDataBody,
// 	options: Options = { language: defaultLanguage },
// ): Promise<GetGameDataResponse> =>
// 	requests(
// 		path,
// 		{ params, method: "GET", ...options },
// 	) as Promise<GetGameDataResponse>;
