import { assertEquals } from "../../deps_testing.ts";
import { worldRecords } from "../../src/srcom/world_records.ts";

Deno.test("Get world records by username", async () => {
	const res = await worldRecords("1", undefined, {
		outputType: "plain",
	});
	const expected = `World Record Count: 1
Fullgame: 0
Individual Level: 10
Total: 10`;
	assertEquals(res, expected);
});
