#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-import=git.sr.ht,esm.sh,deno.land,raw.githubusercontent.com,jsr.io --allow-read --no-check --no-prompt --location=http://speedrunbot-slash/
import { Format, MarkupType } from "./fmt.ts";
import { CommandError, fetch, getUser } from "./utils.ts";
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
	{ outputType }: { outputType?: MarkupType.Object },
): Promise<Posts>;
export async function posts(
	username: string,
	{ outputType }: Opts,
): Promise<string>;
export async function posts(
	username: string,
	{ outputType = MarkupType.Markdown, signal }: Opts = {},
): Promise<string | Posts> {
	const fmt = new Format(outputType);
	const output: string[] = [];

	const user = await getUser(username, { signal });
	if (!user) throw new CommandError(`No user with the username "${username}"`);

	const userAllPostsRes = await fetch(
		`https://www.speedrun.com/users/${user.names.international}/comments`,
		{ signal },
	);
	const userAllPostsText = await userAllPostsRes.text();
	const numberOfPages = parseInt(
		// @ts-ignore the regex will only match numbers
		// And we check below if it's NaN
		userAllPostsText.match(/(\d+)(\s+)?<\/div>(\s+)?<\/a>(\s+)?<\/nav>/)?.[0],
	);
	const fetchPageTasks: (Promise<string> | string)[] = [];
	if (isNaN(numberOfPages)) {
		fetchPageTasks.push(userAllPostsText);
	} else {
		for (let i = 1; i < numberOfPages + 1; i++) {
			fetchPageTasks.push(
				fetch(
					`https://www.speedrun.com/users/${user.names.international}/comments?page=${i}`,
					{ signal },
				).then((res) => res.text()),
			);
		}
	}

	const results = (await Promise.all(fetchPageTasks)).map((page) => {
		const match = page.match(
			/<\s*a href=".*?(\/forums\/|\/runs\/).*?"[^>]*>(.*?)<\s*\/\s*a>/g,
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

	// @ts-ignore I don't think this is possible to fail
	const totalMatches = userAllPostsText.match(
		/Showing \d+ to \d+ of (\d+)?(,)?(\d+)?(,)?(\d+)?/,
	)?.filter((f) => !!f);
	let game = 0;
	let site = 0;

	for (const result of results) {
		game += result.game;
		site += result.site;
	}
	let total = game + site;

	if (totalMatches) {
		switch (totalMatches.length) {
			case 2:
				total = parseInt(totalMatches[1]);
				break;
			case 4:
				total = parseInt(totalMatches[1]) * 1_000 + parseInt(totalMatches[3]);
				break;
			case 6:
				total = parseInt(totalMatches[1]) * 1_000_000 +
					parseInt(totalMatches[3]) * 1_000 + parseInt(totalMatches[5]);
				break;
			default:
				total = 0;
				break;
		}
	}

	const secret = total - (site + game);

	signal?.throwIfAborted();
	if (outputType === MarkupType.Object) {
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
	console.log(await posts(Deno.args[0], { outputType: MarkupType.Terminal }));
}
