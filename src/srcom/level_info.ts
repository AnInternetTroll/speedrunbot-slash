#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-import=git.sr.ht,esm.sh,deno.land,raw.githubusercontent.com,jsr.io --allow-read --no-check --no-prompt --location=http://speedrunbot-slash/
import { Format, MarkupType } from "./fmt.ts";
import { Moogle } from "../../deps_general.ts";
import { CommandError, fetch, getGame, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import { SpeedrunCom } from "./types.d.ts";

export async function levelInfo(
	game: string,
	level: string,
	{ outputType = MarkupType.Markdown, signal }: Opts = {},
): Promise<string> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	if (!game) throw new CommandError("No game found");
	if (!level) throw new CommandError("No level found");

	const gameObj = await getGame(game, { signal });

	if (!gameObj) throw new CommandError("No game found");

	const levels = (await (await fetch(
		`${SRC_API}/games/${gameObj.id}/levels`,
		{ signal },
	)).json()).data as SpeedrunCom.Level[];
	if (!levels.length) throw new CommandError("No levels found");
	const searchService = new Moogle<SpeedrunCom.Level>();
	levels.forEach((level) =>
		searchService.addItem([level.name.toLowerCase()], level)
	);

	const searchResult = searchService.search(level.toLowerCase());

	if (!searchResult.size) throw new CommandError("No level found");

	const levelObj = [...searchResult][0][1].item;

	output.push(`${gameObj.names.international} - ${levelObj.name}`);

	output.push(
		`${fmt.bold("Weblink")}: ${fmt.link(levelObj.weblink, levelObj.name)}`,
	);
	output.push(`${fmt.bold("ID")}: ${levelObj.id}`);
	if (levelObj.rules) output.push(`${fmt.bold("Rules")}: ${levelObj.rules}`);

	return output.join("\n");
}

export default levelInfo;

if (import.meta.main) {
	const [game, level] = Deno.args;
	console.log(
		await levelInfo(game, level, { outputType: MarkupType.Terminal }),
	);
}
