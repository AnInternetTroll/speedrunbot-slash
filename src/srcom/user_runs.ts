#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format } from "./fmt.ts";
import {
	CommandError,
	getAll,
	getGame,
	getUser,
	sec2time,
	SRC_API,
} from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";
import {
	Embed,
	MessageComponentType,
	MessageOptions,
} from "../../deps_server.ts";

interface Run extends SpeedrunCom.Run {
	//How am I meant to give the category a type and variables a type?
	category: any; /*{
		data: {
			variables: {
				data: SpeedrunCom.Variable[];
			};
		};
	};*/

	level: {
		data: SpeedrunCom.Level;
	};
}

export async function userRuns(
	username: string,
	status: string,
	game: string,
	{ outputType = "markdown" }: Opts = {},
): Promise<MessageOptions> {
	const output: string[] = [];

	let apiStatus = "";
	let normalStatus = "";
	if (!status) status = "all";
	switch (status.toLowerCase()) {
		case "all":
			apiStatus = "";
			normalStatus = "All";
			break;
		case "verified":
			apiStatus = "verified";
			normalStatus = "Verified";
			break;
		case "rejected":
			apiStatus = "rejected";
			normalStatus = "Rejected";
			break;
		case "new":
		case "pending":
			apiStatus = "new";
			normalStatus = "Pending";
			break;
	}
	if (!apiStatus || !normalStatus) {
		throw new CommandError("`status` option is not a valid value.");
	}

	const userObj = await getUser(username);
	if (!userObj) throw new CommandError("No user found.");
	let gameId = "";
	if (game) {
		gameId = (await getGame(game) as SpeedrunCom.Game).id;
		if (!gameId) throw new CommandError("No game found.");
	}

	const runs = await getAll<Run>(
		`${SRC_API}/runs?user=${userObj.id}&status=${apiStatus}&embed=level,category.variables&game=${gameId}`,
	);

	output.push(...runs.map((run) => {
		let runCatFullName = run.level.data.name || run.category.data.name;
		if (run.level.data.name) runCatFullName += `: ${run.category.data.name}`;
		const allVariables = Object.entries(run.values).map(([key, value]) => {
			const runVars = run.category.data.variables.data.find((x: any) =>
				x.id == key
			) as SpeedrunCom.Variable;

			return {
				name: runVars.values.values[value as string].label,
				isSubcategory: runVars["is-subcategory"],
			};
		});
		const subCategories = allVariables.filter((x) => x.isSubcategory);
		const variables = allVariables.filter((x) => !x.isSubcategory);
		if (subCategories.length) {
			runCatFullName += ` - ${subCategories.map((x) => x.name).join(", ")}`;
		}
		if (variables.length) {
			runCatFullName += ` (${variables.map((x) => x.name).join(", ")})`;
		}
		return `[${runCatFullName}](${run.weblink}) in ${
			sec2time(run.times.primary_t)
		}`;
	}));

	return ({
		embeds: [
			new Embed({
				title: `${normalStatus} runs: \`${userObj.names.international}\``,
				description: output.join("\n") ||
					`\`${userObj.names.international}\` has no ${normalStatus.toLowerCase()} runs ${
						game ? " or no runs in this game" : ""
					}`,
				thumbnail: {
					url: userObj.assets.image.uri,
				},
			}),
		],
	});
}

if (import.meta.main) {
	const [username, status, game] = Deno.args;
	try {
		console.log(
			await userRuns(username, status, game, { outputType: "terminal" }),
		);
	} catch (err) {
		if (err instanceof CommandError) console.error("Error: ", err.message);
		else console.log("Unexpected Error:", err);
	}
}
