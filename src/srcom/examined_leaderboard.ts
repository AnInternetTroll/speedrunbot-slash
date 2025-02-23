#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-import=git.sr.ht,esm.sh,deno.land,raw.githubusercontent.com,jsr.io --allow-read --no-check --no-prompt --location=http://speedrunbot-slash/
import { Format, MarkupType } from "./fmt.ts";
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

interface LeaderboardMod {
	username: string;
	count: number;
}

function mergeMods(users: LeaderboardMod[]): LeaderboardMod[] {
	const mods = Object.groupBy(users, (user) => user.username);

	return Object.entries(mods).map(([username, entries]) => {
		return {
			username,
			count: entries?.reduce((acc, c) => acc + c.count, 0) ?? 0,
		};
	});
}

export async function examinedLeaderboard(
	game: string,
	status: string | undefined,
	{ outputType }: Opts,
): Promise<string>;
export async function examinedLeaderboard(
	game: string,
	status: string | undefined,
	{ outputType }: { outputType: MarkupType.Object },
): Promise<LeaderboardMod[]>;
export async function examinedLeaderboard(
	game: string,
	status: string | undefined,
	{ outputType = MarkupType.Markdown, signal }: Opts = {},
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
						const user = await getUser(mod);
						url.searchParams.set("examiner", mod);
						const runs = await getAll<SpeedrunCom.Run>(url, { signal });
						return {
							// If a user deleted their account while being a mod
							// then they remain a moderator,
							// even though we can't get the user
							username: user ? user.names.international : "Moderator not found",
							count: runs.length,
						};
					},
				);
			}))).flat(),
		),
	);

	if (outputType === MarkupType.Object) return leaderboard;
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
	const [game, status] = Deno.args;
	console.log(
		await examinedLeaderboard(game, status, {
			outputType: MarkupType.Terminal,
		}),
	);
}
