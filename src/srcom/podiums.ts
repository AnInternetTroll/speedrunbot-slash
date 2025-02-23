#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-import=git.sr.ht,esm.sh,deno.land,raw.githubusercontent.com,jsr.io --allow-read --no-check --no-prompt --location=http://speedrunbot-slash/
import { Format, MarkupType } from "./fmt.ts";
import { CommandError, fetch, getGames, getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";
import { GetUserLeaderboard } from "../../deps_server.ts";

interface PodiumsObject {
	podiums: number;
}

export async function podiums(
	username: string,
	games: string[],
	{ id, outputType }: { id?: boolean; outputType: MarkupType.Object },
): Promise<PodiumsObject>;
export async function podiums(
	username: string,
	games: string[],
	{ id, outputType }: { id?: boolean; outputType?: MarkupType },
): Promise<string>;
export async function podiums(
	username: string,
	games: string[] = [],
	{ outputType = MarkupType.Markdown, signal }: Opts = {},
): Promise<string | PodiumsObject> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	let total = 0;
	const gameCount: Record<string, number> = {};

	const user = await getUser(username, { signal });
	if (!user) throw new CommandError(`${username} user not found.`);

	const gameObjs = await getGames(games, { signal });

	try {
		const userLeaderboard = await GetUserLeaderboard({ userId: user.id });
		userLeaderboard.runs.forEach((run) => {
			if (run.place <= 3) {
				if (!gameObjs.length) total++;
				else {
					if (gameObjs.find((game) => game.id === run.gameId)) {
						total++;
						if (gameObjs.length && gameObjs.length !== 1) {
							// Hopefully we have all the games
							const name = gameObjs.find((g) =>
								g.id === run.gameId
							)!.names.international;
							if (isNaN(gameCount[name])) gameCount[name] = 1;
							else gameCount[name]++;
						}
					}
				}
			}
		});
	} catch (e) {
		console.error("Error in podiums command, using fallback logic", e);
		const res = await fetch(
			`${SRC_API}/users/${user.id}/personal-bests?embed=game`,
			{ signal },
		);
		const runs = (await res.json()).data as {
			place: number;
			run: SpeedrunCom.Run;
			game: { data: SpeedrunCom.Game };
		}[];
		for (let i = 0; i < runs.length; i++) {
			const run = runs[i];
			if (run.place <= 3) {
				if (!gameObjs.length) total++;
				else {
					if (gameObjs.find((game) => game.id === run.game.data.id)) {
						total++;
						if (gameObjs.length && gameObjs.length !== 1) {
							const name = run.game.data.names.international;
							if (isNaN(gameCount[name])) gameCount[name] = 1;
							else gameCount[name]++;
						}
					}
				}
			}
		}

		signal?.throwIfAborted();
	}
	if (outputType === MarkupType.Object) return { podiums: total };

	output.push(`Podium Count: ${user.names.international}`);

	if (Object.keys(gameCount).length) {
		output.push("");
		for (const game in gameCount) {
			output.push(`${fmt.bold(game)}: ${gameCount[game]}`);
		}
		output.push("");
	}

	output.push(`${fmt.bold("Top three runs")}: ${total}`);

	signal?.throwIfAborted();
	return output.join("\n");
}

if (import.meta.main) {
	const [username, ...games] = Deno.args;
	console.log(
		await podiums(username, games, { outputType: MarkupType.Terminal }),
	);
}
