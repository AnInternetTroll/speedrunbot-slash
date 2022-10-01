import { assertEquals } from "../../deps_testing.ts";
import { runsCount } from "../../src/srcom/runs_count.ts";
import { MarkupType } from "../../src/srcom/fmt.ts";

Deno.test("Get user runs by username", async () => {
	const res = await runsCount("1", undefined, undefined, undefined, undefined, {
		outputType: MarkupType.Plain,
	});
	const expected = `Run Count: 1
Fullgame: 81
Individual Level: 125
Total: 206`;
	assertEquals(res, expected);
});

Deno.test("Get how many runs a user has examined by username", async () => {
	const res = await runsCount(
		undefined,
		undefined,
		undefined,
		"7H3",
		undefined,
		{
			outputType: MarkupType.Plain,
		},
	);
	const expected = `Run Count: Examined by 7H3
Fullgame: 44
Individual Level: 31

Verified: 75
Rejected: 0

Total: 75`;
	assertEquals(res, expected);
});
