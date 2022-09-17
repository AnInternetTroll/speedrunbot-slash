#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --no-check
import { Format } from "./fmt.ts";
import {
	CommandError,
	getAll,
	getGames,
	getUser,
	SRC_API,
	statuses,
} from "./utils.ts";
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
	game: string,
	status: string | undefined,
	selfExamined: boolean,
	{ outputType }: Opts,
): Promise<string>;
export async function examinedLeaderboard(
	game: string,
	status: string | undefined,
	selfExamined: boolean,
	{ outputType }: { outputType: "object" },
): Promise<LeaderboardMod[]>;
export async function examinedLeaderboard(
	game: string,
	status: string | undefined,
	selfExamined: boolean,
	{ outputType = "markdown", signal }: Opts = {},
): Promise<string | LeaderboardMod[]> {
	const games = game.split(",");
	const fmt = new Format(outputType);
	const output: string[] = [];

	if (status) {
		if (!Object.keys(statuses).includes(status)) {
			throw new CommandError(
				`Invalid status provided. The only valid status values are ${
					Object.keys(statuses).join(", ")
				}`,
			);
		}
	}

	const urlT = new URL(
		`${SRC_API}/runs${status ? `?status=${encodeURIComponent(status)}` : ""}`,
	);
	const gameObjs = await getGames(games, { signal });

	if (!games.length) throw new CommandError("No games found.");

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
						const runs = await getAll<SpeedrunCom.Run>(url, { signal });
						const noSelfExaminedRuns = runs.filter((run) =>
							run.players.findIndex((player) =>
								player.rel === "user" && player.id === mod
							) === -1
						);
						return {
							username: user.names.international,
							count: selfExamined ? runs.length : noSelfExaminedRuns.length,
						};
					},
				);
			}))).flat(),
		),
	);

	if (outputType === "object") return leaderboard;
	leaderboard.sort((a, b) => b.count - a.count);
	output.push(
		`Examiner leaderboard for ${
			gameObjs.map((a) => a.names.international).join(" and ")
		}${status ? ` - ${statuses[status as keyof (typeof statuses)]}` : ""}`,
	);
	for (const modIndex in leaderboard) {
		output.push(
			`${fmt.bold(leaderboard[modIndex].username)}: ${
				leaderboard[modIndex].count
			}`,
		);
	}
	signal?.throwIfAborted();
	return output.join("\n");
}

if (import.meta.main) {
	const [game, status, selfExamined] = Deno.args;
	console.log(
		await examinedLeaderboard(game, status, !!selfExamined, {
			outputType: "terminal",
		}),
	);
}
