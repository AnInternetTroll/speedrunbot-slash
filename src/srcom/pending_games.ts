#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format } from "./fmt.ts";
import { CommandError, getAll, getGames, sec2time, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

type User = SpeedrunCom.User & {
	rel: "user";
};

type Guest = SpeedrunCom.Guest & {
	rel: "guest";
};

type Run = SpeedrunCom.Run & {
	category: {
		data: SpeedrunCom.Category;
	};
	level: {
		data: SpeedrunCom.Level;
	};
	players: {
		data: (User | Guest)[];
	};
};

export async function pendingGames(
	games: string[] = [],
	{ outputType = "markdown" }: Opts = {},
): Promise<string> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	const url = new URL(
		`${SRC_API}/runs?status=new&embed=category,level,players`,
	);

	const urls: URL[] = [];
	const gameObjs = await getGames(games);

	if (!gameObjs.length) throw new CommandError("No games found");

	gameObjs.forEach((game) => {
		url.searchParams.set("game", game.id);
		urls.push(url);
	});

	const runs = (await Promise.all(urls.map((url) => getAll<Run>(url)))).flat();

	output.push(`Pending: ${games.join(" and ")}`);
	if (runs.length) {
		runs.forEach((run) => {
			output.push(
				`${
					fmt.link(
						run.weblink,
						fmt.bold(
							run.level?.data.name || run.category.data.name,
						),
					)
				} in ${sec2time(run.times.primary_t)} by ${
					run.players.data.map((p) =>
						`${
							p.rel === "user"
								? fmt.link(
									p.weblink,
									p.names.international,
								)
								: p.name
						}`
					).join(" and ")
				}`,
			);
		});
	} else output.push("No pending runs");
	return output.join("\n");
}

if (import.meta.main) {
	console.log(await pendingGames(Deno.args, { outputType: "terminal" }));
}
