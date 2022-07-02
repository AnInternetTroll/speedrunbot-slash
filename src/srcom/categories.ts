#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format, MarkupType } from "./fmt.ts";
import { CommandError, getGame, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

interface CategoriesObject {
	fullGame: string[];
	misc: string[];
}

export async function categories(
	game: string,
	{ outputType }: { outputType: "object" },
): Promise<CategoriesObject>;
export async function categories(
	game: string,
	{ outputType }: { outputType?: MarkupType },
): Promise<string>;
export async function categories(
	game: string,
	{ outputType = "markdown" }: Opts = {},
): Promise<string | CategoriesObject> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	const gameObj = await getGame(game);

	if (!gameObj) throw new CommandError(`${game} game not found.`);

	const res = await fetch(`${SRC_API}/games/${gameObj.id}/categories`);
	const categories = (await res.json()).data as SpeedrunCom.Category[];
	const fullGameCategories: string[] = [];
	const individualLevelCategories: string[] = [];
	const miscCategories: string[] = [];
	categories.forEach((category) => {
		if (category.miscellaneous) miscCategories.push(category.name);
		else if (category.type === "per-game") {
			fullGameCategories.push(category.name);
		} else if (category.type === "per-level") {
			individualLevelCategories.push(category.name);
		}
	});
	output.push(`Categories - ${game}`);
	output.push(
		`${fmt.bold("Fullgame")}: ${
			fullGameCategories.length
				? fullGameCategories.join(", ")
				: "No Full Game categories."
		}`,
	);
	output.push(
		`${fmt.bold("Individual Level")}: ${
			individualLevelCategories.length
				? individualLevelCategories.join(", ")
				: "No Individual Level categories."
		}`,
	);
	output.push(
		`${fmt.bold("Miscellaneous")}: ${
			miscCategories.length
				? miscCategories.join(", ")
				: "No Miscellaneous categories."
		}`,
	);

	return output.join("\n");
}

if (import.meta.main) {
	console.log(await categories(Deno.args[0], { outputType: "terminal" }));
}
