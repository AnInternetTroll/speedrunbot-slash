import { defaultLanguage } from "../constants.ts";
import { requests } from "../utils/mod.ts";
import type { Options } from "../utils/mod.ts";
import type { GetThreadListParams } from "./GetThreadListParams.ts";
import type { GetThreadListResponse } from "./GetThreadListResponse.ts";

const path = "/GetThreadList";

export const GetThreadList = (
	params: GetThreadListParams,
	options: Options = { language: defaultLanguage },
): Promise<GetThreadListResponse> =>
	requests(
		path,
		{ params, ...options },
	) as Promise<GetThreadListResponse>;
