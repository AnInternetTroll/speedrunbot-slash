#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import {
	CommandError,
	getCategoryObj,
	getGame,
	getUser,
	sec2time,
	SRC_API,
} from "./utils.ts";
import { Format } from "./fmt.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

// Strongly copied from
// https://github.com/Mango0x45/speedrunbot-plusplus/blob/38a7231805c966d55b1e23cd7e94a7ddd042088e/src/srcom/worldrecord.py
export async function worldRecord(
	game: string,
	category?: string,
	subcategory?: string,
	// For consistency sake
	// deno-lint-ignore no-unused-vars
	{ outputType = "markdown" }: Opts = {},
): Promise<string> {
	const output: string[] = [];
	const fmt = new Format(outputType);

	const gameObj = await getGame(game);
	if (!gameObj) throw new CommandError(`No game '${game}' found`);

	// Get the games categories
	const categories: SpeedrunCom.Category[] =
		(await (await fetch(`${SRC_API}/games/${gameObj.id}/categories`)).json())
			.data;
	let categoryObj: SpeedrunCom.Category | SpeedrunCom.Level | false = false,
		levelFlag = false;

	if (category) {
		categoryObj = getCategoryObj(category, categories);
		// No matching fullgame cat, so check ILs.
		if (!categoryObj) {
			const categories: SpeedrunCom.Level[] =
				(await (await fetch(`${SRC_API}/games/${gameObj.id}/levels`))
					.json()).data;
			categoryObj = getCategoryObj(category, categories);
			if (!categoryObj) throw new CommandError("No category found");
		}
	} else {
		// Get default category if none supplied.
		if (!categories.length) {
			throw new CommandError("The game does not have any categories");
		}
		categoryObj = categories[0];
		if ((categoryObj as SpeedrunCom.Category).type === "per-level") {
			const categories: SpeedrunCom.Level[] =
				(await (await fetch(`${SRC_API}/games/${gameObj.id}/levels`))
					.json()).data;
			if (!categories.length) {
				throw new CommandError("The game does not have any categories");
			}
			categoryObj = categories[0];
			levelFlag = true;
		}
	}

	// Get WR
	const variables: SpeedrunCom.Variable[] = (await (await fetch(
		`${SRC_API}/${
			levelFlag ? "levels" : "categories"
		}/${categoryObj.id}/variables`,
	)).json()).data;
	const subcategoryName = subcategory?.toLocaleLowerCase();

	let variableObj: SpeedrunCom.Variable | false = false,
		variableValue: string | false = false;
	variableLoop:
	for (const variable of variables) {
		if (variable["is-subcategory"]) {
			for (const value in variable.values.values) {
				if (
					variable.values.values[value].label.toLocaleLowerCase() ===
						subcategoryName
				) {
					variableObj = variable;
					variableValue = value;
					break variableLoop;
				}
			}
		}
	}

	let leaderboard: SpeedrunCom.Leaderboard;
	// ILs.
	if (levelFlag) {
		const categories: SpeedrunCom.Category[] =
			(await (await fetch(`${SRC_API}/levels/${categoryObj.id}/categories`))
				.json()).data;
		const individualLevel = categories[0];
		leaderboard = (await (await fetch(
			`${SRC_API}/leaderboards/${gameObj.id}/level/${categoryObj.id}/${individualLevel.id}?${new URLSearchParams(
				{
					top: "1",
					[`var-${variableObj ? variableObj.id : ""}`]: variableValue
						? variableValue
						: "",
				},
			)}`,
		)).json()).data;
	} else {
		leaderboard = (await (await fetch(
			`${SRC_API}/leaderboards/${gameObj.id}/category/${categoryObj.id}?${new URLSearchParams(
				{
					top: "1",
					[`var-${variableObj ? variableObj.id : ""}`]: variableValue
						? variableValue
						: "",
				},
			)}`,
		)).json()).data;
	}

	if (!leaderboard.runs.length) {
		throw new CommandError("No runs have been set in this category");
	}

	let wr: SpeedrunCom.Run;
	try {
		wr = leaderboard.runs[0].run;
	} catch (_e) {
		throw new CommandError(
			`The category '${category}' is an IL category, not level`,
		);
	}
	const playersTasks: Promise<string>[] = wr.players.map((player) =>
		player.rel === "user"
			? getUser(player.id).then((user) =>
				user ? fmt.link(user.weblink, user.names.international) : ""
			)
			: // @ts-ignore A player can be a guest
				player.name
	);
	const players = await Promise.all(playersTasks);

	output.push(
		`World Record: ${gameObj.names.international} - ${categoryObj.name} ${
			variableObj ? variableObj.name : ""
		}`,
	);
	output.push(
		`${fmt.bold("Time")}: ${sec2time(wr.times.primary_t)} ${
			players.join(" and ")
		}`,
	);

	output.push(fmt.link(wr.weblink, fmt.bold("Weblink")));

	output.push(
		`${
			wr.videos?.links && Array.isArray(wr.videos.links)
				? wr.videos.links.map((link) => link.uri)
				: "No video available."
		}`,
	);

	return output.join("\n");
}

if (import.meta.main) {
	const [game, category, subcategory] = Deno.args;
	console.log(
		await worldRecord(game, category, subcategory, { outputType: "terminal" }),
	);
}
