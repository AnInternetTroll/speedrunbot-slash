#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format } from "./fmt.ts";
import { CommandError, getAll, getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

export async function modCount(
	username: string,
	{ outputType = "markdown" }: Opts = {},
): Promise<string> {
	const fmt = new Format(outputType);
	const output: string[] = [];

	const user = await getUser(username);
	if (!user) throw new CommandError(`${username} user not found.`);

	const games = await getAll(
		`${SRC_API}/games?moderator=${user.id}&_bulk=true`,
	) as SpeedrunCom.Game[];
	const series = await getAll(
		`${SRC_API}/series?moderator=${user.id}&_bulk=true`,
	) as SpeedrunCom.Game[];

	output.push(`${fmt.bold("Mod Count")}: ${user.names.international}`);
	output.push(`Games: ${games.length}`);
	output.push(`Series: ${series.length}`);
	return output.join("\n");
}

if (import.meta.main) {
	console.log(await modCount(Deno.args[0], { outputType: "terminal" }));
}
