import { assertEquals } from "../../deps_testing.ts";
import { posts } from "../../src/srcom/posts.ts";


Deno.test("Get user posts by username", async () => {
	const res = await posts("1", { outputType: "plain" });
	const expected = `Posts: 1
Site Forums: 606
Game Forums: 774
Secret Forums: 0
Total: 1365`;
	assertEquals(res, expected);
});
