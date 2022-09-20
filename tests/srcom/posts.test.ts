import { assertEquals } from "../../deps_testing.ts";
import { posts } from "../../src/srcom/posts.ts";

Deno.test("Get user posts by username", async () => {
	const res = await posts("7h3", { outputType: "plain" });
	const expected = `Posts: 7H3
Site Forums: 1
Game Forums: 4
Total: 5`;
	assertEquals(res, expected);
});
