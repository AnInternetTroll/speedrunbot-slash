import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { getUser } from "../../src/srcom/utils.ts";
import whois, { dateFormat } from "../../src/srcom/whois.ts";

Deno.test("Get user by username", async () => {
	const res = await whois("AnInternetTroll", { outputType: "plain" });
	const user = await getUser("AnInternetTroll");
	if (!user) throw new Error("Invalid user");
	const expected = `Username: ${user.names.international}
Signed up: ${dateFormat(new Date(user.signup))}
Socials: https://www.youtube.com/channel/UCYP1Hr3mGPZTCzOdZfF_2Qg, https://www.twitch.tv/aninternettroll
Country: ${user.location.country.names.international} (${user.location.country.code})`;
	assertEquals(res, expected);
});
