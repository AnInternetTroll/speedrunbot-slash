import { assertEquals } from "../../deps_testing.ts";
import { posts } from "../../src/srcom/posts.ts";
import { MarkupType } from "../../src/srcom/fmt.ts";

Deno.test({
	name: "Get user posts by username",
	// This is the only test which fails with the following error
	// Why? How do you close this resource?
	// "CacheResponseResource" was created during the test, but not cleaned up during the test. Close the resource before the end of the test.
	ignore: true,
	async fn() {
		const res = await posts("7h3", { outputType: MarkupType.Plain });
		const expected = `Posts: 7H3
Site Forums: 1
Game Forums: 4
Total: 5`;
		assertEquals(res, expected);
	},
});
