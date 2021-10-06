#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format } from "./fmt.ts";
import { getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

export const dateFormat = Intl.DateTimeFormat("en-uk", {
	day: "numeric",
	month: "long",
	year: "numeric",
	timeZone: "Europe/London",
}).format;

export async function whois(
	username: string,
	{ id = false, outputType = "markdown" }: Opts = {},
): Promise<string> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	username = encodeURI(username);
	let data: SpeedrunCom.User | false;
	if (!id) {
		const res = await fetch(`${SRC_API}/users?lookup=${username}`).then((res) =>
			res.json()
		);
		data = res.data[0] || false;
	} else {
		data = await getUser(username);
	}
	if (!data) output.push(`No user with the username "${username}"`);
	else {
		output.push(`${fmt.bold("Username")}: ${data.names.international}`);
		if (data.pronouns) output.push(`${fmt.bold("Pronouns")}: ${data.pronouns}`);
		output.push(
			`${fmt.bold("Signed up")}: ${dateFormat(new Date(data.signup))}`,
		);
		if (data.role !== "user") {
			output.push(
				`${fmt.bold("Role")}: ${data.role}`,
			);
		}
		if (
			data.youtube || data.twitch || data.twitter || data.hitbox ||
			data.speedrunslive
		) {
			const socials: string[] = [];
			if (data.youtube) socials.push(fmt.link(data.youtube.uri, "Youtube"));
			if (data.hitbox) socials.push(fmt.link(data.hitbox.uri, "Hitbox"));
			if (data.twitch) socials.push(fmt.link(data.twitch.uri, "Twitch"));
			if (data.twitter) {
				socials.push(fmt.link(data.twitter.uri, "Twitter"));
			}
			if (data.speedrunslive) {
				socials.push(fmt.link(data.speedrunslive.uri, "SpeedrunsLive"));
			}
			output.push(`${fmt.bold("Socials")}: ${socials.join(", ")}`);
		}
		if (data.location.region) {
			output.push(
				`${fmt.bold("Region")}: ${data.location.region.names.international} ${
					data.location.region.names.japanese
						? `(${data.location.region.names.japanese})`
						: ""
				}/${data.location.region.code}`,
			);
		} else if (data.location.country) {
			output.push(
				`${fmt.bold("Country")}: ${data.location.country.names.international} ${
					data.location.country.names.japanese
						? `(${data.location.country.names.japanese})`
						: ""
				}(${data.location.country.code})`,
			);
		}
	}
	return output.join("\n");
}

export default whois;

if (import.meta.main) {
	console.log(await whois(Deno.args[0], { outputType: "markdown" }));
}
