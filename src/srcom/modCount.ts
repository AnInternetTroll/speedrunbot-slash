#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format } from "./fmt.ts";
import { getAll, getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

export async function modCount(
	username: string,
	{ id = false, outputType = "markdown" }: Opts = {},
): Promise<string> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	let userId: string;
	if (!id) {
		const userIdTmep = await getUser(username);
		if (!userIdTmep) return `No user with the username "${username}"`;
		else {
			userId = userIdTmep.id;
			username = userIdTmep.names.international;
		}
	} else userId = username;

	const games = await getAll(
		`${SRC_API}/games?moderator=${userId}&_bulk=true`,
	) as SpeedrunCom.Game[];
	const series = await getAll(
		`${SRC_API}/series?moderator=${userId}&_bulk=true`,
	) as SpeedrunCom.Game[];

	output.push(`${fmt.bold("Mod Count")}: ${username}`);
	output.push(`Games: ${games.length}`);
	output.push(`Series: ${series.length}`);
	return output.join("\n");
}

if (import.meta.main) {
	console.log(await modCount(Deno.args[0], { outputType: "terminal" }));
}
