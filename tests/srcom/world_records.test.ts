import { assertEquals } from "../../deps_testing.ts";
import { worldRecords } from "../../src/srcom/world_records.ts";
import { MarkupType } from "../../src/srcom/fmt.ts";

Deno.test("Get world records by username", async () => {
	const res = await worldRecords("1", undefined, {
		outputType: MarkupType.Plain,
	});
	const expected = `World Record Count: 1
Fullgame: 1
Individual Level: 9
Total: 10`;
	assertEquals(res, expected);
});
