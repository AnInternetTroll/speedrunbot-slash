#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --no-check
import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { Format } from "./fmt.ts";
import { getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

export async function worldRecords(
	username: string,
	games: string[] = [],
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

	const res = await fetch(
		`${SRC_API}/users/${userId}/personal-bests?embed=game`,
	);
	const data = (await res.json()).data as {
		place: number;
		run: SpeedrunCom.Run;
		game: { data: SpeedrunCom.Game };
	}[];
	let fullGameRuns = 0;
	let individualLevelRuns = 0;
	data.forEach((run) => {
		if (
			run.place === 1 &&
			(!games.length || games.includes(run.game.data.abbreviation))
		) {
			if (run.run.level) individualLevelRuns++;
			else fullGameRuns++;
		}
	});
	output.push(`${fmt.bold("World Record Count")}: ${username}`);
	output.push(`Fullgame: ${fullGameRuns}`);
	output.push(`Individual Level: ${individualLevelRuns}`);
	output.push(`Total: ${fullGameRuns + individualLevelRuns}`);
	return output.join("\n");
}

if (import.meta.main) {
	const [username, ...games] = Deno.args;
	console.log(await worldRecords(username, games, { outputType: "terminal" }));
}
Deno.test("Get world records by username", async () => {
	const res = await worldRecords("AnInternetTroll", undefined, {
		outputType: "plain",
	});
	const expected = `World Record Count: AnInternetTroll
Fullgame: 0
Individual Level: 0
Total: 0`;
	assertEquals(res, expected);
});
