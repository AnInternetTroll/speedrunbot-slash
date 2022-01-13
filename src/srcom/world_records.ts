#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --no-check
import { Format } from "./fmt.ts";
import { getGames, getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

export async function worldRecords(
	username: string,
	games: string[] = [],
	{ outputType = "markdown" }: Opts = {},
): Promise<string> {
	const gameObjs = await getGames(games);
	const fmt = new Format(outputType);
	const output: string[] = [];
	const user = await getUser(username);
	if (!user) return `${username} user not found.`;

	const res = await fetch(
		`${SRC_API}/users/${user.id}/personal-bests?top=1`,
	);

	const data = (await res.json()).data as {
		place: number;
		run: SpeedrunCom.Run;
	}[];

	let fullGameRuns = 0;
	let individualLevelRuns = 0;

	data.forEach((run) => {
		if (
			run.place === 1 &&
			(!games.length || gameObjs.find((game) => game.id === run.run.game))
		) {
			if (run.run.level) individualLevelRuns++;
			else fullGameRuns++;
		}
	});

	output.push(`${fmt.bold("World Record Count")}: ${user.names.international}`);
	output.push(`Fullgame: ${fullGameRuns}`);
	output.push(`Individual Level: ${individualLevelRuns}`);

	output.push(`Total: ${fullGameRuns + individualLevelRuns}`);
	return output.join("\n");
}

if (import.meta.main) {
	const [username, ...games] = Deno.args;
	console.log(await worldRecords(username, games, { outputType: "terminal" }));
}
