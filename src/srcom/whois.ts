#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format } from "./fmt.ts";
import { CommandError, getUser } from "./utils.ts";
import type { Opts } from "./utils.ts";

export const dateFormat = Intl.DateTimeFormat("en-uk", {
	day: "numeric",
	month: "long",
	year: "numeric",
	timeZone: "Europe/London",
}).format;

export async function whois(
	username: string,
	{ outputType = "markdown" }: Opts = {},
): Promise<string> {
	const fmt = new Format(outputType);
	const output: string[] = [];

	const user = await getUser(username);
	if (!user) throw new CommandError(`No user with the username "${username}"`);

	output.push(`${fmt.bold("Username")}: ${user.names.international}`);
	if (user.pronouns) output.push(`${fmt.bold("Pronouns")}: ${user.pronouns}`);
	output.push(
		`${fmt.bold("Signed up")}: ${dateFormat(new Date(user.signup))}`,
	);
	if (user.role !== "user") {
		output.push(
			`${fmt.bold("Role")}: ${user.role}`,
		);
	}
	if (
		user.youtube || user.twitch || user.twitter || user.hitbox ||
		user.speedrunslive
	) {
		const socials: string[] = [];
		if (user.youtube) socials.push(fmt.link(user.youtube.uri, "YouTube"));
		if (user.hitbox) socials.push(fmt.link(user.hitbox.uri, "Hitbox"));
		if (user.twitch) socials.push(fmt.link(user.twitch.uri, "Twitch"));
		if (user.twitter) {
			socials.push(fmt.link(user.twitter.uri, "Twitter"));
		}
		if (user.speedrunslive) {
			socials.push(fmt.link(user.speedrunslive.uri, "SpeedrunsLive"));
		}
		output.push(`${fmt.bold("Socials")}: ${socials.join(", ")}`);
	}
	if (user.location.region) {
		output.push(
			`${fmt.bold("Region")}: ${user.location.region.names.international} ${
				user.location.region.names.japanese
					? `(${user.location.region.names.japanese})`
					: ""
			}/${user.location.region.code}`,
		);
	} else if (user.location.country) {
		output.push(
			`${fmt.bold("Country")}: ${user.location.country.names.international} ${
				user.location.country.names.japanese
					? `(${user.location.country.names.japanese})`
					: ""
			}(${user.location.country.code})`,
		);
	}
	return output.join("\n");
}

export default whois;

if (import.meta.main) {
	console.log(await whois(Deno.args[0], { outputType: "terminal" }));
}
