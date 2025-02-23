#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-import=git.sr.ht,esm.sh,deno.land,raw.githubusercontent.com,jsr.io --allow-read --no-check --no-prompt --location=http://speedrunbot-slash/
import { MarkupType } from "./fmt.ts";
import { CommandError, fetch, getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";
import { GetUserLeaderboard } from "../../deps_server.ts";

interface CategoriesObject {
	categoriesPlayed: number;
}

export async function categoriesPlayed(
	username: string,
	games: string[],
	{ outputType }: Opts & { outputType: "object" },
): Promise<CategoriesObject>;
export async function categoriesPlayed(
	username: string,
	games: string[],
	{ outputType }: Opts & { outputType?: MarkupType },
): Promise<string>;
export async function categoriesPlayed(
	username: string,
	games: string[] = [],
	{ outputType = MarkupType.Markdown, signal }: Opts = {},
): Promise<string | CategoriesObject> {
	games = games.filter((a) => !!a);
	const output: string[] = [];
	const categories: string[] = [];
	const user = await getUser(username, { signal });

	if (!user) throw new CommandError(`${username} user not found.`);
	try {
		const userLeaderboard = await GetUserLeaderboard({ userId: user.id });
		userLeaderboard.runs.forEach((run) => {
			if (categories.includes(run.categoryId)) return;
			else {
				if (games.length) {
					if (games.includes(run.gameId)) {
						categories.push(run.categoryId);
					} else return;
				} else categories.push(run.categoryId);
			}
		});
	} catch (e) {
		console.error(
			"Error in categories_played command, using fallback logic",
			e,
		);
		const res = await fetch(
			`${SRC_API}/users/${user.id}/personal-bests?embed=game`,
		);
		const runs = (await res.json()).data as {
			place: number;
			run: SpeedrunCom.Run;
			game: { data: SpeedrunCom.Game };
		}[];
		runs.forEach((run) => {
			if (categories.includes(run.run.category)) return;
			else {
				if (games.length) {
					if (games.includes(run.game.data.abbreviation)) {
						categories.push(run.run.category);
					} else return;
				} else categories.push(run.run.category);
			}
		});
	}

	if (outputType === MarkupType.Object) {
		return { categoriesPlayed: categories.length };
	}

	output.push(`Categories Played: ${username}`);
	output.push(`${categories.length}`);
	signal?.throwIfAborted();
	return output.join("\n");
}

if (import.meta.main) {
	const [username, ...games] = Deno.args;
	console.log(
		await categoriesPlayed(username, games, {
			outputType: MarkupType.Terminal,
		}),
	);
}
