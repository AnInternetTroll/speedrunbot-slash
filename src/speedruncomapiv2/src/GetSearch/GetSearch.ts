import { defaultLanguage } from "../constants.ts";
import { requests } from "../utils/mod.ts";
import type { Options } from "../utils/mod.ts";
import type { GetSearchParams } from "./GetSearchParams.ts";
import type { GetSearchResponse } from "./GetSearchResponse.ts";

const path = "/GetSearch";

export const GetSearch = (
	params: GetSearchParams,
	options: Options = { language: defaultLanguage },
): Promise<GetSearchResponse> =>
	requests(
		path,
		{ params, ...options },
	) as Promise<GetSearchResponse>;
