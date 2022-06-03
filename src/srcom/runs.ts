#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format } from "./fmt.ts";
import { CommandError, getAll, getGames, getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

export async function runs(
	username: string,
	games: string[] = [],
	{ outputType = "markdown" }: Opts = {},
): Promise<string> {
	games = games.filter((a) => !!a);
	const fmt = new Format(outputType);
	const output: string[] = [];
	const user = await getUser(username);

	if (!user) throw new CommandError(`${username} not found`);

	const url = new URL(`${SRC_API}/runs?user=${user.id}&embed=game`);

	const runs: SpeedrunCom.Run[] = [];
	if (games.length) {
		const gameObjs: SpeedrunCom.Game[] = await getGames(games);
		const tasks: Promise<SpeedrunCom.Run[]>[] = [];
		for (const game of gameObjs) {
			url.searchParams.set("game", game.id);
			tasks.push(getAll<SpeedrunCom.Run>(url));
		}
		const runObjs = (await Promise.all(tasks)).flat();
		runs.push(...runObjs);
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

	output.push(`Run Count: ${user.names.international}`);
	output.push(`${fmt.bold("Fullgame")}: ${fullGameRuns}`);
	output.push(`${fmt.bold("Individual Level")}: ${individualLevelRuns}`);

	if (Object.keys(gameCount).length) {
		output.push("");
		for (const game in gameCount) {
			output.push(`${fmt.bold(game)}: ${gameCount[game]}`);
		}
		output.push("");
	}

	output.push(`${fmt.bold("Total")}: ${fullGameRuns + individualLevelRuns}`);
	return output.join("\n");
}

if (import.meta.main) {
	const [username, ...games] = Deno.args;
	try {
		console.log(await runs(username, games, { outputType: "terminal" }));
	} catch (err) {
		if (err instanceof CommandError) console.error("Error:", err.message);
		else console.log("Unexpected Error:", err);
	}
}
