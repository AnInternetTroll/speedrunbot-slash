import type { Options } from "../utils/mod.ts";
import { requests } from "../utils/requests.ts";

const path = "/PutGameBoostGrant";

export interface PutGameBoostGrantBody {
	gameId: string;
	anonymous: boolean;
}

export const PutGameBoostGrant = (
	body: PutGameBoostGrantBody,
	options: Options,
): Promise<Record<string | number | symbol, never>> =>
	requests(path, { body, method: "POST", ...options }) as Promise<
		Record<string | number | symbol, never>
	>;
