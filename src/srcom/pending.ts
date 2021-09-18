#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format } from "./fmt.ts";
import { getAll, getGame, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";
import { TimeDelta } from "https://esm.sh/@silane/datetime";

function sec2time(timeInSeconds: number): string {
	return new TimeDelta({ seconds: timeInSeconds }).toString().replaceAll(
		"000",
		"",
	);
}

// @ts-ignore how are you supposed to do this?
interface Run extends SpeedrunCom.Run {
	category: {
		data: SpeedrunCom.Category;
	};
	level: {
		data: SpeedrunCom.Level;
	};
	players: { data: SpeedrunCom.User[] };
}

export async function pending(
	games: string[] = [],
	{ id = false, outputType = "markdown" }: Opts = {},
): Promise<string> {
	games = games.filter((a) => !!a);
	const fmt = new Format(outputType);
	const output: string[] = [];
	const url = new URL(
		`${SRC_API}/runs?status=new&embed=category,level,players`,
	);

	const runs: Run[] = [];
	const urls: URL[] = [];
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
			urls.push(url);
		}
		const allRuns = await Promise.all(urls.map((url) => getAll(url)));
		allRuns.forEach((runList) => runs.push.apply(runs, runList as Run[]));
	} else {
		runs.push.apply(runs, await getAll(url) as Run[]);
	}
	output.push(`${fmt.bold("Pending")}: ${games.join(" and ")}`);
	if (outputType === "markdown") {
		runs.forEach((run) => {
			output.push(
				`[${run.level?.data.name ||
					run.category.data.name}](${run.weblink}) in \`${
					sec2time(run.times.primary_t)
				}\` by ${
					run.players.data.map((p) =>
						// @ts-ignore A user can be a guest
						`[${p.rel === "guest" ? p.name : p.names.international}](${
							// @ts-ignore A user can be a guest
							p.rel === "guest" ? p.uri : p.weblink
						})`
					).join(" and ")
				}`,
			);
		});
	} else {
		runs.forEach((run) => {
			output.push(
				`${run.level?.data.name || run.category.data.name} in ${
					sec2time(run.times.primary_t)
				} by ${
					run.players.data.map((p) =>
						// @ts-ignore A user can be a guest
						p.rel === "guest" ? p.name : p.names.international
					).join(" and ")
				}`,
			);
		});
	}
	return output.join("\n");
}

if (import.meta.main) {
	console.log(await pending(Deno.args, { outputType: "markdown" }));
}
