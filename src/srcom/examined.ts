#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --no-check
import { Format, MarkupType } from "./fmt.ts";
import { getAll, getGame, getGames, getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";
interface ExaminedObject {
	total: number;
	fullGame: number;
	individualLevel: number;
	verified: number;
	rejected: number;
}

export async function examined(
	username: string,
	games: string[],
	{ outputType }: Opts,
): Promise<string>;
export async function examined(
	username: string,
	games: string[],
	{ outputType }: { outputType: "object" },
): Promise<ExaminedObject>;
export async function examined(
	username: string,
	games: string[] = [],
	{ outputType = "markdown" }: Opts = {},
): Promise<string | ExaminedObject> {
	const fmt = new Format(outputType);
	const output: string[] = [];

	const user = await getUser(username);
	if (!user) return `${username} user not found.`;

	const url = new URL(`${SRC_API}/runs?examiner=${user.id}`);

	const gameObjs = await getGames(games);
	const tasks: Promise<SpeedrunCom.Run[]>[] = [];

	if (gameObjs.length) {
		gameObjs.forEach((game) => {
			url.searchParams.set("game", game.id);
			tasks.push(getAll<SpeedrunCom.Run>(url));
		});
	} else {
		tasks.push(getAll<SpeedrunCom.Run>(url));
	}

	const runs: SpeedrunCom.Run[] = (await Promise.all(tasks)).flat();

	let fullGameRuns = 0;
	let individualLevelRuns = 0;
	let verifiedRuns = 0;
	let rejectedRuns = 0;
	runs.forEach((run) => {
		if (run.level) individualLevelRuns++;
		else fullGameRuns++;
		if (run.status.status === "verified") verifiedRuns++;
		else rejectedRuns++;
	});
	if (outputType === "object") {
		return {
			total: runs.length,
			fullGame: fullGameRuns,
			individualLevel: individualLevelRuns,
			verified: verifiedRuns,
			rejected: rejectedRuns,
		};
	}

	output.push(`${fmt.bold("Examined Count")}: ${user.names.international}`);
	output.push(`Fullgame: ${fullGameRuns}`);
	output.push(`Individual Level: ${individualLevelRuns}`);
	output.push("");
	output.push(`Verified: ${verifiedRuns}`);
	output.push(`Rejected: ${rejectedRuns}`);
	output.push("");
	output.push(`Total: ${fullGameRuns + individualLevelRuns}`);
	return output.join("\n");
}

if (import.meta.main) {
	const [username, ...games] = Deno.args;
	console.log(await examined(username, games, { outputType: "terminal" }));
}
