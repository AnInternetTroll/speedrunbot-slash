#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --no-check
import { Format } from "./fmt.ts";
import {
	getCategories,
	getGame,
	getLeaderboard,
	getVariables,
	SRC_API,
} from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

import FuzzySet from "https://esm.sh/fuzzyset@1.0.6";

export async function worldRecord(
	game: string,
	category: string,
	subcategories: string[],
	{ outputType = "markdown" }: Opts = {},
): Promise<string> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	const gameObj = await getGame(game);
	if (!gameObj) return `${game} game not found.`;
	const categoriesObj = await getCategories(game);
	if (!categoriesObj) {
		return "Something went wrong when getting the categories.";
	}

	const categoryNames = FuzzySet(categoriesObj.map((cat) => cat.name), false)
		.get(
			category,
		);
	if (!categoryNames || !categoryNames[0]) {
		return `${category} category not found.`;
	}

	const [_, categoryName] = categoryNames[0];
	const categoryObj = categoriesObj.find((cat) => cat.name === categoryName);
	const variablesObj = await getVariables(gameObj.id);
	if (!variablesObj) return "Something went wrong when getting the variables.";

	const variableValuesObjs = variablesObj.map((variable) =>
		{
			// @ts-ignore The missing value gets added a tad later
			const values: {
				[id: string]: {
					label: string;
					rules: string;
					flags: SpeedrunCom.Flags;
					subcategoryId: string;
				};
			} = variable.values.values
			for (const val in values) values[val].subcategoryId = variable.id;
			return values
		}
	);
	const omgPlsHelp = variableValuesObjs.map((variable) =>
		Object.entries(variable)
	);
	const variableNamesSet = FuzzySet(
		omgPlsHelp.map((a) => a.map((b) => b[1].label)).flat(),
		false,
	);

	const subcategoryIds: Record<string, string> = {};
	const results = subcategories.map((a) => variableNamesSet.get(a));

	console.log(
		subcategories.map(cat => variableNamesSet.get(cat)).flat()[0][1],
	);

	// await getLeaderboard(gameObj.id, categoryObj.id);

	return output.join("\n");
}

if (import.meta.main) {
	const [game, category, ...subcategories] = Deno.args;
	console.log(
		await worldRecord(game, category, subcategories, {
			outputType: "terminal",
		}),
	);
}
