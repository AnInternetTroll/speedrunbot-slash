#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format, MarkupType } from "./fmt.ts";
import { getGame, getUser, SRC_API } from "./utils.ts";
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
	{ id = false, outputType = "markdown" }: Opts = {},
): Promise<string | PodiumsObject> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	// @ts-ignore the .filter should filter out all the bad stuff
	const gameIDs: { id: string; abbreviation: string }[] =
		(await Promise.all(games.map((gameID) => getGame(gameID)))).map((game) =>
			game ? { id: game.id, abbreviation: game.abbreviation } : undefined
		).filter((a) => !!a);

	let userId: string;
	if (!id) {
		const userIdTmep = await getUser(username);
		if (!userIdTmep) return `No user with the username "${username}"`;
		else {
			userId = userIdTmep.id;
			username = userIdTmep.names.international;
		}
	} else userId = username;

	const res = await fetch(
		`${SRC_API}/users/${userId}/personal-bests?embed=game`,
	);
	const runs = (await res.json()).data as {
		place: number;
		run: SpeedrunCom.Run;
		game: { data: SpeedrunCom.Game };
	}[];
	let total = 0;

	for (let i = 0; i < runs.length; i++) {
		const run = runs[i];
		if (run.place <= 3) {
			if (!games.length) total++;
			else {
				if (id) {
					if (gameIDs.find((gameObj) => run.run.game === gameObj.id)) total++;
					else continue;
				} else {
					if (
						gameIDs.find((gameObj) =>
							gameObj.abbreviation === run.game.data.abbreviation
						)?.id
					) {
						total++;
					}
				}
			}
		}
	}

	if (outputType === "object") return { podiums: total };

	output.push(`${fmt.bold("Podium Count")}: ${username}`);
	output.push(`Top three runs: ${total}`);
	return output.join("\n");
}

if (import.meta.main) {
	const [username, ...games] = Deno.args;
	console.log(await podiums(username, games, { outputType: "terminal" }));
}
