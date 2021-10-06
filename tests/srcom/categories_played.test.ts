import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { categoriesPlayed } from "../../src/srcom/categories_played.ts";

Deno.test("Get how many runs a user has examined by username", async () => {
  const res = await categoriesPlayed("7H3", [], {
    outputType: "plain",
  });
  const expected = `Categories Played: 7H3
448`;
  assertEquals(res, expected);
});
