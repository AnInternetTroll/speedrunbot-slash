#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format } from "./fmt.ts";
import { Moogle } from "../../deps_general.ts";
import { getGame, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import { SpeedrunCom } from "./types.d.ts";

export async function levelInfo(
	game: string,
	level: string,
	{ outputType = "markdown" }: Opts = {},
): Promise<string> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	if (!game) return "No game found";
	if (!level) return "No level found";

	const gameObj = await getGame(game);

	if (!gameObj) return "No game found";

	const levels = (await (await fetch(
		`${SRC_API}/games/${gameObj.id}/levels`,
	)).json()).data as SpeedrunCom.Level[];
	if (!levels.length) return "No levels found";
	const searchService = new Moogle<SpeedrunCom.Level>();
	levels.forEach((level) =>
		searchService.addItem([level.name.toLowerCase()], level)
	);

	const searchResult = searchService.search(level.toLowerCase());

	if (!searchResult.size) return "No level found";

	const levelObj = [...searchResult][0][1].item;

	output.push(`${gameObj.names.international} - ${levelObj.name}`);

	output.push(`Weblink: ${fmt.link(levelObj.weblink, levelObj.name)}`);
	output.push(`ID: ${levelObj.id}`);
	if (levelObj.rules) output.push(`Rules: ${levelObj.rules}`);

	return output.join("\n");
}

export default levelInfo;

if (import.meta.main) {
	const [game, level] = Deno.args;
	console.log(await levelInfo(game, level, { outputType: "markdown" }));
}
