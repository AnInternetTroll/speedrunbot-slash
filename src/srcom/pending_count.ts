#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format } from "./fmt.ts";
import { getAll, getGames, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

export async function pendingCount(
	games: string[] = [],
	{ outputType = "markdown" }: Opts = {},
): Promise<string> {
	games = games.filter((a) => !!a);
	const fmt = new Format(outputType);
	const output: string[] = [];
	const url = new URL(`${SRC_API}/runs?status=new&embed=game`);
	const runs: SpeedrunCom.Run[] = [];

	if (games.length) {
		const tasks: Promise<SpeedrunCom.Run[]>[] = [];
		const gameObjs = await getGames(games);
		for (const game in gameObjs) {
			url.searchParams.set("game", gameObjs[game].id);
			games[game] = gameObjs[game].names.international;
			tasks.push(getAll<SpeedrunCom.Run>(url));
		}
		const runsResponses = (await Promise.all(tasks)).flat();
		runs.push(...runsResponses);
	} else {
		runs.push.apply(runs, await getAll(url) as SpeedrunCom.Run[]);
	}
	let fullGameRuns = 0;
	let individualLevelRuns = 0;
	const gameCount: Record<string, number> = {};

	runs.forEach((run) => {
		if (run.level) individualLevelRuns++;
		else fullGameRuns++;
		if (games.length && games.length !== 1) {
			// @ts-ignore If I put in the link `embed=game` then this will exist
			const name = run.game.data.names.international;
			if (isNaN(gameCount[name])) gameCount[name] = 1;
			else gameCount[name]++;
		}
	});
	output.push(`${fmt.bold("Pending count")}: ${games.join(" and ")}`);
	output.push(`Fullgame: ${fullGameRuns}`);
	output.push(`Individual Level: ${individualLevelRuns}`);

	if (Object.keys(gameCount).length) {
		output.push("");
		for (const game in gameCount) output.push(`${game}: ${gameCount[game]}`);
		output.push("");
	}

	output.push(`Total: ${fullGameRuns + individualLevelRuns}`);
	return output.join("\n");
}

if (import.meta.main) {
	console.log(await pendingCount(Deno.args, { outputType: "terminal" }));
}
