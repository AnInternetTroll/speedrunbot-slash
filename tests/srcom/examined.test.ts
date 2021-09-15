import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { examined } from "../../src/srcom/examined.ts";

Deno.test("Get how many runs a user has examined by username", async () => {
	const res = await examined("AnInternetTroll", [], {
		outputType: "plain",
	});
	const expected = `Examined Count: AnInternetTroll
Fullgame: 362
Individual Level: 184
---
Verified: 208
Rejected: 338
---
Total: 546`;
	assertEquals(res, expected);
});
