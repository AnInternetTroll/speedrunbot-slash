import { assertEquals } from "../../deps_testing.ts";
import { examined } from "../../src/srcom/examined.ts";

Deno.test("Get how many runs a user has examined by username", async () => {
	const res = await examined("7H3", [], {
		outputType: "plain",
	});
	const expected = `Examined Count: 7H3
Fullgame: 44
Individual Level: 31

Verified: 75
Rejected: 0

Total: 75`;
	assertEquals(res, expected);
});
