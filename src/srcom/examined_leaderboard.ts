#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --no-check
import { Format } from "./fmt.ts";
import { getAll, getGames, getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";
import { groupBy } from "../../deps_general.ts";

interface LeaderboardMod {
	username: string;
	count: number;
}

function mergeMods(users: LeaderboardMod[]): LeaderboardMod[] {
	const mods = groupBy(users, (user) => user.username);

	return Object.entries(mods).map(([username, entries]) => {
		return {
			username,
			// @ts-ignore I'm don't understand why `entries` can be undefined
			count: entries.reduce((acc, c) => acc + c.count, 0),
		};
	});
}

export async function examinedLeaderboard(
	games: string[],
	{ outputType }: Opts,
): Promise<string>;
export async function examinedLeaderboard(
	games: string[],
	{ outputType }: { outputType: "object" },
): Promise<LeaderboardMod[]>;
export async function examinedLeaderboard(
	games: string[],
	{ outputType = "markdown" }: Opts = {},
): Promise<string | LeaderboardMod[]> {
	games = games.filter((a) => !!a);
	const fmt = new Format(outputType);
	const output: string[] = [];

	const urlT = new URL(`${SRC_API}/runs`);
	const gameObjs = await getGames(games);

	const leaderboard = mergeMods(
		await Promise.all(
			(await Promise.all(gameObjs.map<Promise<LeaderboardMod>[]>((gameObj) => {
				const urlG = new URL(urlT.toString());
				urlG.searchParams.set("game", gameObj.id);
				return Object.keys(gameObj.moderators).map<Promise<LeaderboardMod>>(
					async (mod) => {
						const url = new URL(urlG.toString());
						// @ts-ignore The user exists or else they wouldn't be a mod
						const user: SpeedrunCom.User = await getUser(mod);
						url.searchParams.set("examiner", mod);
						const runs = await getAll<SpeedrunCom.Run>(url);
						return {
							username: user.names.international,
							count: runs.length,
						};
					},
				);
			}))).flat(),
		),
	);

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
