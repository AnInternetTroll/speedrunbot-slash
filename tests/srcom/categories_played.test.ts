import { assertEquals } from "../../deps_testing.ts";
import { categoriesPlayed } from "../../src/srcom/categories_played.ts";
import { MarkupType } from "../../src/srcom/fmt.ts";

Deno.test("Get how many runs a user has examined by username", async () => {
	const res = await categoriesPlayed("1", [], {
		outputType: MarkupType.Plain,
	});
	const expected = `Categories Played: 1
30`;
	assertEquals(res, expected);
});
