import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { games } from "../../src/srcom/games.ts";

Deno.test("Get how many runs a user has examined by username", async () => {
	const res = await games("AnInternetTroll", {
		outputType: "plain",
	});
	const expected = `Games Played: AnInternetTroll
7`;
	assertEquals(res, expected);
});
