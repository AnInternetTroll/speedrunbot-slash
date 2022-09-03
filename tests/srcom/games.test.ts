import { assertEquals } from "../../deps_testing.ts";
import { games } from "../../src/srcom/games.ts";

Deno.test("Get how many runs a user has examined by username", async () => {
	const res = await games("1", {
		outputType: "plain",
	});
	const expected = `Games Played: 1
11`;
	assertEquals(res, expected);
});
