import { requests } from "../utils/mod.ts";
import type { Options } from "../utils/mod.ts";
import type { PutAuthSignupBody } from "./PutAuthSignupBody.ts";

const path = "/PutAuthSignup";

export const PutAuthSignup = (
	body: PutAuthSignupBody,
	options: Options,
): Promise<Record<string | number | symbol, never>> =>
	requests(path, { body, method: "POST", ...options }) as Promise<
		Record<string | number | symbol, never>
	>;
