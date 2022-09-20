import { assertEquals } from "../../deps_testing.ts";
import whois from "../../src/srcom/whois.ts";

Deno.test("Get user by username", async () => {
	const res = await whois("7H3", { outputType: "plain" });
	const expected = `Username: 7H3
ID: v81ggnp8
Signed up: 7 July 2019
Role: banned
Socials: https://www.youtube.com/channel/UC1OiPUfoGgJ7EQDY2w3I3uA, https://www.twitch.tv/m.gdtheone, https://www.twitter.com/mobile.EsKeDit7
Region: Ontario, Canada /ca/on`;
	assertEquals(res, expected);
});
