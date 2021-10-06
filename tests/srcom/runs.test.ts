import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { runs } from "../../src/srcom/runs.ts";

Deno.test("Get user runs by username", async () => {
	const res = await runs("7H3", undefined, { outputType: "plain" });
	const expected = `Run Count: 7H3
Fullgame: 1148
Individual Level: 461
Total: 1609`;
	assertEquals(res, expected);
});
