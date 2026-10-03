import { assert } from "./deps.ts";
import { GetGameLeaderboard2, Language } from "../mod.ts";

Deno.test({
	name: "GetGameLeaderboard2",
	async fn() {
		const actual = await GetGameLeaderboard2({
			"params": {
				"categoryId": "jdzwjprd",
				"emulator": 0,
				"gameId": "v1po7r76",
				"obsolete": 0,
				"platformIds": [],
				"regionIds": [],
				"timer": 0,
				"verified": 1,
				"values": [{ "variableId": "38djrke8", "valueIds": ["810w83wq"] }, {
					"variableId": "ylqmjgwn",
					"valueIds": ["zqoo3wxq"],
				}, { "variableId": "yn2mrw08", "valueIds": ["14o568jq"] }],
				"video": 0,
			},
			"page": "1",
		}, { language: Language.en });
		assert(actual, "We got a response");
	},
});
