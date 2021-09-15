import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { runs } from "../../src/srcom/runs.ts";

Deno.test("Get user runs by username", async () => {
	const res = await runs("AnInternetTroll", undefined, { outputType: "plain" });
	const expected = `Run Count: AnInternetTroll
Fullgame: 20
Individual Level: 48
Total: 68`;
	assertEquals(res, expected);
});
