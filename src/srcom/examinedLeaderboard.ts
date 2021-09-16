#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --no-check
import { Format } from "./fmt.ts";
import { getAll, getGame, getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

interface LeaderboardMod {
	username: string;
	count: number;
}

export async function examinedLeaderboard(
	games: string[],
	{ id, outputType }: Opts,
): Promise<string>;
export async function examinedLeaderboard(
	games: string[],
	{ id, outputType }: { id?: boolean; outputType: "object" },
): Promise<LeaderboardMod[]>;
export async function examinedLeaderboard(
	games: string[],
	{ id = false, outputType = "markdown" }: Opts = {},
): Promise<string | LeaderboardMod[]> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	const leaderboard: LeaderboardMod[] = [];
	const url = new URL(`${SRC_API}/runs`);
	for (const game in games) {
		let gameObj: SpeedrunCom.Game | false;
		if (!id) {
			gameObj = await getGame(games[game]);
		} else {
			const res = await fetch(`${SRC_API}/games/${games[game]}`);
			const data = await res.json();
			gameObj = data.data as SpeedrunCom.Game;
		}
		if (!gameObj) continue;
		url.searchParams.set("game", gameObj.id);
		for (const mod in gameObj.moderators) {
			const user = await getUser(mod, true);
			if (!user) continue;
			url.searchParams.set("examiner", mod);
			const runs = await getAll(url) as SpeedrunCom.Run[];
			const el = leaderboard.findIndex((mod) =>
				mod.username === user.names.international
			);
			if (el !== -1) {
				leaderboard[el] = {
					count: leaderboard[el].count + runs.length,
					username: leaderboard[el].username,
				};
			} else {
				leaderboard.push({
					count: runs.length,
					username: user.names.international,
				});
			}
		}
	}
	if (outputType === "object") return leaderboard;
	leaderboard.sort((a, b) => b.count - a.count);
	output.push(
		`${fmt.bold("Examiner leaderboard")} for ${
			games.filter((a) => a).join(" and ")
		}`,
	);
	for (const modIndex in leaderboard) {
		output.push(
			`${leaderboard[modIndex].username}: ${leaderboard[modIndex].count}`,
		);
	}
	return output.join("\n");
}

if (import.meta.main) {
	console.log(await examinedLeaderboard(Deno.args, { outputType: "markdown" }));
}
