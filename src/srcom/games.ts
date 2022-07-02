#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { MarkupType } from "./fmt.ts";
import { CommandError, getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

interface GamesObject {
	games: number;
}

export async function games(
	username: string,
	{ outputType }: { outputType: "object" },
): Promise<GamesObject>;
export async function games(
	username: string,
	{ outputType }: { outputType?: MarkupType },
): Promise<string>;
export async function games(
	username: string,
	{ outputType = "markdown" }: Opts = {},
): Promise<string | GamesObject> {
	const output: string[] = [];
	const games: string[] = [];
	const user = await getUser(username);
	if (!user) throw new CommandError(`${username} user not found.`);

	const res = await fetch(`${SRC_API}/users/${user.id}/personal-bests`);
	const runs = (await res.json()).data as {
		place: number;
		run: SpeedrunCom.Run;
	}[];

	runs.forEach((run) => {
		if (games.includes(run.run.game)) return;
		else games.push(run.run.game);
	});

	if (outputType === "object") return { games: games.length };

	output.push(`Games Played: ${user.names.international}`);
	output.push(`${games.length}`);
	return output.join("\n");
}

if (import.meta.main) {
	console.log(await games(Deno.args[0], { outputType: "terminal" }));
}
