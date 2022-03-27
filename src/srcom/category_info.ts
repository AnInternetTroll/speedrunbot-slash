#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format } from "./fmt.ts";
import { Moogle } from "../../deps_general.ts";
import { CommandError, getGame, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import { SpeedrunCom } from "./types.d.ts";

export async function categoryInfo(
	game: string,
	category: string,
	{ outputType = "markdown" }: Opts = {},
): Promise<string> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	if (!game) throw new CommandError("No game found");
	if (!category) throw new CommandError("No category found");

	const gameObj = await getGame(game);

	if (!gameObj) throw new CommandError("No game found");

	const categories =
		(await (await fetch(`${SRC_API}/games/${gameObj.id}/categories`)).json())
			.data as SpeedrunCom.Category[];

	if (!categories.length) throw new CommandError("No categories found");

	const searchService = new Moogle<SpeedrunCom.Category>();

	categories.forEach((category) =>
		searchService.addItem([category.name.toLowerCase()], category)
	);

	const searchResult = searchService.search(category.toLowerCase());
	if (!searchResult.size) return "No category found";

	const categoryObj = [...searchResult][0][1].item;
	const variables =
		(await (await fetch(`${SRC_API}/categories/${categoryObj.id}/variables`))
			.json()).data as SpeedrunCom.Variable[];

	output.push(`${gameObj.names.international} - ${categoryObj.name}`);
	output.push(`Weblink: ${fmt.link(categoryObj.weblink, categoryObj.name)}`);
	output.push(`ID: ${categoryObj.id}`);
	output.push(`Rules: ${categoryObj.rules}`);
	output.push(
		`Variables: ${variables.map((variable) => variable.name).join(", ")}`,
	);

	return output.join("\n");
}

export default categoryInfo;

if (import.meta.main) {
	const [game, category] = Deno.args;
	console.log(await categoryInfo(game, category, { outputType: "markdown" }));
}
