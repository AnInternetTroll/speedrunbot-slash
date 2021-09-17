import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { categoriesPlayed } from "../../src/srcom/categoriesPlayed.ts";

Deno.test("Get how many runs a user has examined by username", async () => {
	const res = await categoriesPlayed("AnInternetTroll", [], {
		outputType: "plain",
	});
	const expected = `Categories Played: AnInternetTroll
15`;
	assertEquals(res, expected);
});
