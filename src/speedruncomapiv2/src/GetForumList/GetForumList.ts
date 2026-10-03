import { defaultLanguage } from "../constants.ts";
import { requests } from "../utils/mod.ts";
import type { Options } from "../utils/mod.ts";
import type { GetForumListParams } from "./GetForumListParams.ts";
import type { GetForumListResponse } from "./GetForumListResponse.ts";

const path = "/GetForumList";

export const GetForumList = (
	params: GetForumListParams,
	options: Options = { language: defaultLanguage },
): Promise<GetForumListResponse> =>
	requests(
		path,
		{ params, ...options },
	) as Promise<GetForumListResponse>;
