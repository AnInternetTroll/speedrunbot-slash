import { assertEquals } from "../../deps_testing.ts";
import { runs } from "../../src/srcom/runs.ts";

Deno.test("Get user runs by username", async () => {
	const res = await runs("1", undefined, { outputType: "plain" });
	const expected = `Run Count: 1
Fullgame: 81
Individual Level: 125
Total: 206`;
	assertEquals(res, expected);
});
