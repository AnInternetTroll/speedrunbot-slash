import { assertEquals } from "../../deps_testing.ts";
import { games } from "../../src/srcom/games.ts";
import { MarkupType } from "../../src/srcom/fmt.ts";

Deno.test("Get how many runs a user has examined by username", async () => {
	const res = await games("1", {
		outputType: MarkupType.Plain,
	});
	const expected = `Games Played: 1
12`;
	assertEquals(res, expected);
});
