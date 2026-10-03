import { assert } from "./deps.ts";
import { GetUserLeaderboard, Language } from "../mod.ts";

Deno.test({
	name: "GetUserLeaderboard",
	async fn() {
		const actual = await GetUserLeaderboard({
			"userId": "7j477kvj",
		}, { language: Language.en });
		assert(actual, "We got a response");
	},
});
