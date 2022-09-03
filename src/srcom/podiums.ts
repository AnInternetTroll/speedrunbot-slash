#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format, MarkupType } from "./fmt.ts";
import { CommandError, getGames, getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

interface PodiumsObject {
	podiums: number;
}

export async function podiums(
	username: string,
	games: string[],
	{ id, outputType }: { id?: boolean; outputType: "object" },
): Promise<PodiumsObject>;
export async function podiums(
	username: string,
	games: string[],
	{ id, outputType }: { id?: boolean; outputType?: MarkupType },
): Promise<string>;
export async function podiums(
	username: string,
	games: string[] = [],
	{ outputType = "markdown", signal }: Opts = {},
): Promise<string | PodiumsObject> {
	const fmt = new Format(outputType);
	const output: string[] = [];

	const user = await getUser(username, { signal });
	if (!user) throw new CommandError(`${username} user not found.`);

	const gameObjs = await getGames(games, { signal });

	const res = await fetch(
		`${SRC_API}/users/${user.id}/personal-bests?embed=game`,
		{ signal },
	);
	const runs = (await res.json()).data as {
		place: number;
		run: SpeedrunCom.Run;
		game: { data: SpeedrunCom.Game };
	}[];
	let total = 0;
	const gameCount: Record<string, number> = {};

	for (let i = 0; i < runs.length; i++) {
		const run = runs[i];
		if (run.place <= 3) {
			if (!gameObjs.length) total++;
			else {
				if (gameObjs.find((game) => game.id === run.game.data.id)) {
					total++;
					if (gameObjs.length && gameObjs.length !== 1) {
						const name = run.game.data.names.international;
						if (isNaN(gameCount[name])) gameCount[name] = 1;
						else gameCount[name]++;
					}
				}
			}
		}
	}

	signal?.throwIfAborted();
	if (outputType === "object") return { podiums: total };

	output.push(`Podium Count: ${user.names.international}`);

	if (Object.keys(gameCount).length) {
		output.push("");
		for (const game in gameCount) {
			output.push(`${fmt.bold(game)}: ${gameCount[game]}`);
		}
		output.push("");
	}

	output.push(`${fmt.bold("Top three runs")}: ${total}`);

	signal?.throwIfAborted();
	return output.join("\n");
}

if (import.meta.main) {
	const [username, ...games] = Deno.args;
	console.log(await podiums(username, games, { outputType: "terminal" }));
}
