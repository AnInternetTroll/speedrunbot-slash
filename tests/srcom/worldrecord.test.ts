import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { worldRecords } from "../../src/srcom/worldrecords.ts";

Deno.test("Get world records by username", async () => {
	const res = await worldRecords("AnInternetTroll", undefined, {
		outputType: "plain",
	});
	const expected = `World Record Count: AnInternetTroll
Fullgame: 0
Individual Level: 0
Total: 0`;
	assertEquals(res, expected);
});
