import { defaultLanguage } from "../constants.ts";
import { requests } from "../utils/mod.ts";
import type { Options } from "../utils/mod.ts";
import type { GetCommentListParams } from "./GetCommentListParams.ts";
import type { GetCommentListResponse } from "./GetCommentListResponse.ts";

const path = "/GetCommentList";

export const GetCommentList = (
	params: GetCommentListParams,
	options: Options = { language: defaultLanguage },
): Promise<GetCommentListResponse> =>
	requests(
		path,
		{ params, ...options },
	) as Promise<GetCommentListResponse>;
