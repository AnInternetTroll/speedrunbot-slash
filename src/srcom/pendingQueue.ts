#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format } from "./fmt.ts";
import { getAll, getGame, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

export async function pendingQueue(
	games: string[] = [],
	{ id = false, outputType = "markdown" }: Opts = {},
): Promise<string> {
	games = games.filter((a) => !!a);
	const fmt = new Format(outputType);
	const output: string[] = [];
	const url = new URL(`${SRC_API}/runs?status=new`);

	const runs: SpeedrunCom.Run[] = [];
	if (games.length) {
		for (const game in games) {
			let gameId: string;
			if (id) gameId = games[game];
			else {
				const gameObj = await getGame(games[game]);
				if (gameObj) gameId = gameObj.id;
				else continue;
			}
			url.searchParams.set("game", gameId);
			runs.push.apply(runs, await getAll(url) as SpeedrunCom.Run[]);
		}
	} else {
		runs.push.apply(runs, await getAll(url) as SpeedrunCom.Run[]);
	}
	let fullGameRuns = 0;
	let individualLevelRuns = 0;
	runs.forEach((run) => {
		if (run.level) individualLevelRuns++;
		else fullGameRuns++;
	});
	output.push(`${fmt.bold("Pending count")}: ${games.join(" and ")}`);
	output.push(`Fullgame: ${fullGameRuns}`);
	output.push(`Individual Level: ${individualLevelRuns}`);
	output.push(`Total: ${fullGameRuns + individualLevelRuns}`);
	return output.join("\n");
}

if (import.meta.main) {
	console.log(await pendingQueue(Deno.args, { outputType: "terminal" }));
}
