#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-import=git.sr.ht,esm.sh,deno.land,raw.githubusercontent.com,jsr.io --allow-read --no-check --no-prompt --location=http://speedrunbot-slash/
import { Format, MarkupType } from "./fmt.ts";
import { CommandError, fetch, getGames, getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";
import { GetUserLeaderboard } from "../../deps_server.ts";

export async function worldRecords(
	username: string,
	games: string[] = [],
	{ outputType = MarkupType.Markdown }: Opts = {},
): Promise<string> {
	games = games.filter((a) => !!a);
	const fmt = new Format(outputType);
	let fullGameRuns = 0;
	let individualLevelRuns = 0;
	const user = await getUser(username);
	if (!user) throw new CommandError(`${username} user not found.`);
	const gameObjs = await getGames(games);

	const output: string[] = [];
	try {
		const userLeaderboard = await GetUserLeaderboard({
			userId: user.id,
		});

		userLeaderboard.runs.forEach((run) => {
			if (
				run.place === 1 &&
				(!games.length ||
					gameObjs.find((game) => game.id === run.gameId))
			) {
				if (run.levelId) individualLevelRuns++;
				else fullGameRuns++;
			}
		});
	} catch (e) {
		console.error("Error in world_records command, using fallback logic", e);
		const res = await fetch(
			`${SRC_API}/users/${user.id}/personal-bests?top=1`,
		);

		const data = (await res.json()).data as {
			place: number;
			run: SpeedrunCom.Run;
		}[];

		data.forEach((run) => {
			if (
				run.place === 1 &&
				(!games.length || gameObjs.find((game) => game.id === run.run.game))
			) {
				if (run.run.level) individualLevelRuns++;
				else fullGameRuns++;
			}
		});
	}

	output.push(
		`World Record Count: ${user.names.international}${
			gameObjs.length
				? " - " +
					gameObjs.map((game) => game.names.international).join(" and ")
				: ""
		}`,
	);
	output.push(`${fmt.bold("Fullgame")}: ${fullGameRuns}`);
	output.push(`${fmt.bold("Individual Level")}: ${individualLevelRuns}`);

	output.push(`${fmt.bold("Total")}: ${fullGameRuns + individualLevelRuns}`);
	return output.join("\n");
}

if (import.meta.main) {
	const [username, ...games] = Deno.args;
	console.log(
		await worldRecords(username, games, { outputType: MarkupType.Terminal }),
	);
}
