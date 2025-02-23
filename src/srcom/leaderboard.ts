#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-import=git.sr.ht,esm.sh,deno.land,raw.githubusercontent.com,jsr.io --allow-read --no-check --no-prompt --location=http://speedrunbot-slash/
import { Format, MarkupType } from "./fmt.ts";
import {
	CommandError,
	fetch,
	getCategoryObj,
	getGame,
	getUser,
	sec2time,
	SRC_API,
} from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

// Heavilly copied from
// https://github.com/Mango0x45/speedrunbot-plusplus/blob/38a7231805c966d55b1e23cd7e94a7ddd042088e/src/srcom/leaderboard.py
export async function leaderboard(
	game: string,
	category: string,
	subcategory: string,
	{ outputType = MarkupType.Markdown, signal }: Opts,
): Promise<string> {
	if (!game) throw new CommandError("No game found");
	const output: string[] = [];
	const fmt = new Format(outputType);
	const gameObj = await getGame(game, { signal });
	if (!gameObj) throw new CommandError(`No game '${game}' found`);

	const categories =
		(await (await fetch(`${SRC_API}/games/${gameObj.id}/categories`, {
			signal,
		})).json())
			.data as SpeedrunCom.Category[];
	let levelFlag = false;
	let categoryObj: SpeedrunCom.Level | SpeedrunCom.Category | false = false;

	if (category) {
		categoryObj = getCategoryObj(category, categories);
		if (!categoryObj) {
			const levels =
				(await (await fetch(`${SRC_API}/games/${gameObj.id}/levels`)).json())
					.data as SpeedrunCom.Level[];
			categoryObj = getCategoryObj(category, levels);
			levelFlag = true;
			if (!categoryObj) {
				throw new CommandError(`No category '${category}' found`);
			}
		}
	} else {
		// Get default category if none supplied
		if (!categories.length) {
			throw new CommandError(
				`The game '${gameObj.names.international}' has no categories`,
			);
		}
		categoryObj = categories[0];
		if ((categoryObj as SpeedrunCom.Category)?.type === "per-level") {
			const levels =
				(await (await fetch(`${SRC_API}/games/${gameObj.id}/levels`, {
					signal,
				})).json())
					.data as SpeedrunCom.Level[];
			if (!levels.length) {
				throw new CommandError("Game has no categories or levels");
			}
			categoryObj = levels[0];
			levelFlag = true;
		}
	}

	// Get top 10
	const subcategories = (await (await fetch(
		`${SRC_API}/${
			levelFlag ? "levels" : "categories"
		}/${categoryObj.id}/variables`,
		{ signal },
	)).json()).data as SpeedrunCom.Variable[];

	const categoryNameLowercase = subcategory ? subcategory.toLowerCase() : "";
	let subcategoryObj: false | SpeedrunCom.Variable = false;
	let subCategoryValue = "";
	let subCategoryValueLabel = "";

	subcategoryLoop:
	for (const cat of subcategories) {
		if (cat["is-subcategory"]) {
			for (const key in cat.values.values) {
				if (
					cat.values.values[key].label.toLowerCase() == categoryNameLowercase
				) {
					subcategoryObj = cat;
					subCategoryValue = key;
					subCategoryValueLabel = cat.values.values[key].label;
					break subcategoryLoop;
				}
			}
		}
	}

	let leaderboard: SpeedrunCom.Leaderboard;
	if (levelFlag) {
		// ILs
		const categories =
			(await (await fetch(`${SRC_API}/levels/${categoryObj.id}/categories`, {
				signal,
			}))
				.json()).data as SpeedrunCom.Category[];
		leaderboard = (await (await fetch(
			`${SRC_API}/leaderboards/${gameObj.id}/level/${categoryObj.id}/${
				categories[0].id
			}?${new URLSearchParams({
				top: "10",
				[`var-${subcategoryObj ? subcategoryObj.id : ""}`]: subCategoryValue,
			})}`,
			{ signal },
		)).json()).data as SpeedrunCom.Leaderboard;
	} else {
		leaderboard = (await (await fetch(
			`${SRC_API}/leaderboards/${gameObj.id}/category/${categoryObj.id}?${new URLSearchParams(
				{
					top: "10",
					[`var-${subcategoryObj ? subcategoryObj.id : ""}`]: subCategoryValue,
				},
			)}`,
			{ signal },
		)).json()).data as SpeedrunCom.Leaderboard;
	}
	// Get first runs
	const rows = await Promise.all(
		leaderboard.runs.splice(0, 10).map(async (run) =>
			`${run.place} ${
				fmt.link(run.run.weblink, sec2time(run.run.times.primary_t))
			} ${await Promise.all(
				run.run.players.map(async (player) => {
					if (player.rel === "user") {
						const user = await getUser(player.id, {
							signal,
						}) as SpeedrunCom.User;
						return fmt.link(user.weblink, user.names.international);
					} else return (player.name as string).replace(/^\[.*\]/, "");
				}),
			)}`
		),
	);

	output.push(
		`Top ${rows.length}: ${gameObj.names.international} - ${categoryObj.name} ${subCategoryValueLabel}`,
	);
	if (!rows.length) output.push("No runs have been set in this category.");
	else {
		output.push(...rows);
	}

	signal?.throwIfAborted();
	return output.join("\n");
}

export default leaderboard;

if (import.meta.main) {
	const [game, category, subcategory] = Deno.args;
	console.log(
		await leaderboard(game, category, subcategory, {
			outputType: MarkupType.Terminal,
		}),
	);
}
