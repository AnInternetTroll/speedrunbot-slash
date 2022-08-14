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

export interface Posts {
	game: number;
	site: number;
	secret: number;
	total: number;
}

// Strongly copied from
// https://github.com/Mango0x45/speedrunbot-plusplus/blob/38a7231805c966d55b1e23cd7e94a7ddd042088e/src/srcom/posts.sh
export async function posts(
	username: string,
	{ outputType }: { outputType?: "object" },
): Promise<Posts>;
export async function posts(
	username: string,
	{ outputType }: Opts,
): Promise<string>;
export async function posts(
	username: string,
	{ outputType = "markdown", signal }: Opts = {},
): Promise<string | Posts> {
	const fmt = new Format(outputType);
	const output: string[] = [];

	const user = await getUser(username, { signal });
	if (!user) throw new CommandError(`No user with the username "${username}"`);

	const userAllPostsRes = await fetch(
		`https://www.speedrun.com/${user.names.international}/allposts`,
		{ signal },
	);
	const userAllPostsText = await userAllPostsRes.text();
	const numberOfPages = parseInt(
		// @ts-ignore the regex will only match numbers
		// And we check below if it's NaN
		userAllPostsText.match(/Page 1 of (\d+)+/)?.[1],
	);
	const fetchPageTasks: Promise<string>[] = [];

	if (
		userAllPostsText.includes(
			"This user has not posted anything on the forum yet.",
		)
	) {
		return "This user has not posted anything on the forum yet.";
	} else if (isNaN(numberOfPages)) {
		fetchPageTasks.push(
			fetch(
				`https://www.speedrun.com/${user.names.international}/allposts`,
				{ signal },
			).then((res) => res.text()),
		);
	} else {
		for (let i = 1; i < numberOfPages + 1; i++) {
			fetchPageTasks.push(
				fetch(
					`https://www.speedrun.com/${user.names.international}/allposts/${i}`,
					{ signal },
				).then((res) => res.text()),
			);
		}
	}

	const results = (await Promise.all(fetchPageTasks)).map((page) => {
		const match = page.match(
			/<\s*a href='\/(.*?)\/forum'[^>]*>(.*?)<\s*\/\s*a>/g,
		);
		const sitePattern =
			/supporter|news|introductions|speedrunning|streaming_recording_equipment|tournaments_and_races|talk|the_site/;
		let game = 0;
		let site = 0;

		if (match) {
			for (const link of match) {
				if (sitePattern.test(link)) site++;
				else game++;
			}
		}

		return {
			game,
			site,
		};
	});

	const userInfoRes = await fetch(
		`https://www.speedrun.com/user/${user.names.international}/info`,
		{ signal },
	);
	const userInfoText = await userInfoRes.text();

	// @ts-ignore I don't think this is possible to fail
	const total = parseInt(userInfoText.match(/.*Posts:[^0-9]*([0-9]*).*/)?.[1]);
	let game = 0;
	let site = 0;

	for (const result of results) {
		game += result.game;
		site += result.site;
	}

	const secret = total - site - game;

	signal?.throwIfAborted();
	if (outputType === "object") {
		return {
			game,
			site,
			secret,
			total,
		};
	}

	output.push(`${fmt.bold("Posts")}: ${user.names.international}`);
	output.push(`Site Forums: ${site}`);
	output.push(`Game Forums: ${game}`);
	if (secret) output.push(`Secret Forums: ${secret}`);
	output.push(`Total: ${total}`);

	signal?.throwIfAborted();
	return output.join("\n");
}

export default posts;

if (import.meta.main) {
	console.log(await posts(Deno.args[0], { outputType: "terminal" }));
}
