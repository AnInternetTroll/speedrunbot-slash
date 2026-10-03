import { defaultLanguage } from "../constants.ts";
import { requests } from "../utils/mod.ts";
import type { Options } from "../utils/mod.ts";
import type { GetThreadParams } from "./GetThreadParams.ts";
import type { GetThreadResponse } from "./GetThreadResponse.ts";

const path = "/GetThread";

export const GetThread = (
	params: GetThreadParams,
	options: Options = { language: defaultLanguage },
): Promise<GetThreadResponse> =>
	requests(
		path,
		{ params, ...options },
	) as Promise<GetThreadResponse>;
