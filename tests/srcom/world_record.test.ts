import { assertEquals } from "../../deps_testing.ts";
import { worldRecords } from "../../src/srcom/world_records.ts";

Deno.test("Get world records by username", async () => {
	const res = await worldRecords("7H3", undefined, {
		outputType: "plain",
	});
	const expected = `World Record Count: 7H3
Fullgame: 41
Individual Level: 168
Total: 209`;
	assertEquals(res, expected);
});
