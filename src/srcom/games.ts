#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format, MarkupType } from "./fmt.ts";
import { getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

interface GamesObject {
	games: number;
}

export async function games(
	username: string,
	{ id, outputType }: { id?: boolean; outputType: "object" },
): Promise<GamesObject>;
export async function games(
	username: string,
	{ id, outputType }: { id?: boolean; outputType?: MarkupType },
): Promise<string>;
export async function games(
	username: string,
	{ id = false, outputType = "markdown" }: Opts = {},
): Promise<string | GamesObject> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	const games: string[] = [];
	let userId: string;
	if (!id) {
		const userIdTmep = await getUser(username);
		if (!userIdTmep) return `No user with the username "${username}"`;
		else {
			userId = userIdTmep.id;
			username = userIdTmep.names.international;
		}
	} else userId = username;

	const res = await fetch(`${SRC_API}/users/${userId}/personal-bests`);
	const runs = (await res.json()).data as {
		place: number;
		run: SpeedrunCom.Run;
	}[];
	runs.forEach((run) => {
		if (games.includes(run.run.game)) return;
		else games.push(run.run.game);
	});

	if (outputType === "object") return { games: games.length };

	output.push(`${fmt.bold("Games Played")}: ${username}`);
	output.push(`${games.length}`);
	return output.join("\n");
}

if (import.meta.main) {
	console.log(await games(Deno.args[0], { outputType: "terminal" }));
}
