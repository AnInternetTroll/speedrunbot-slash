#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-import=git.sr.ht,esm.sh,deno.land,raw.githubusercontent.com,jsr.io --allow-read --no-check --no-prompt --location=http://speedrunbot-slash/
import { Format, MarkupType } from "./fmt.ts";
import { CommandError, fetch, getGame, getUser, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import { SpeedrunCom } from "./types.d.ts";

export async function gameInfo(
	game: string,
	{ outputType = MarkupType.Markdown, signal }: Opts = {},
): Promise<string> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	if (!game) throw new CommandError("No game found");

	const gameObj = await getGame(game, { signal });

	if (!gameObj) throw new CommandError(`No game '${game}' found`);

	const genres = await Promise.all(
		gameObj.genres.map((genre) =>
			fetch(`${SRC_API}/genres/${genre}`).then((res) =>
				res.json() as Promise<{ data: SpeedrunCom.Genre }>
			).then((genre) => genre.data.name)
		),
	);

	const moderators = await Promise.all(
		Object.entries(gameObj.moderators).map(([userId, _status]) =>
			(getUser(userId, { signal }) as Promise<SpeedrunCom.User>).then((user) =>
				// As much as I would like to show the moderator status
				// The API will return "super-moderator" for verifiers and super moderators
				// So that is too confusing
				fmt.link(user.weblink, user.names.international)
			)
		),
	);

	output.push(gameObj.names.international);

	output.push(
		`${fmt.bold("Weblink")}: ${
			fmt.link(gameObj.weblink, gameObj.abbreviation)
		}`,
	);
	output.push(`${fmt.bold("ID")}: ${gameObj.id}`);
	if (gameObj.discord) {
		output.push(`${fmt.bold("Discord invite")}: ${gameObj.discord}`);
	}

	output.push(
		`${fmt.bold("Release date")}: ${
			new Date(gameObj["release-date"]).toDateString()
		}`,
	);

	output.push(
		`${fmt.bold("Added on speedrun.com")}: ${
			new Date(gameObj.created).toDateString()
		}`,
	);
	if (genres.length) output.push(`${fmt.bold("Genres")}: ${genres.join(", ")}`);

	output.push(
		`${fmt.bold("Moderators")}: ${
			moderators.length ? moderators.join(", ") : "No moderators found"
		}`,
	);

	output.push(
		`${fmt.bold("Rules")}: Timing method - ${
			gameObj.ruleset["default-time"]
		}, ${
			gameObj.ruleset["emulators-allowed"]
				? "Allows emulators"
				: "No emulators allowed"
		}${
			gameObj.ruleset["require-verification"]
				? ""
				: ", Doesn't require verification"
		}${gameObj.ruleset["require-video"] ? "" : ", No video required"}, ${
			gameObj.ruleset["show-milliseconds"]
				? "Must specify milliseconds"
				: "Milliseconds optional"
		}`,
	);
	if (gameObj.romhack) output.push("Romhack");

	signal?.throwIfAborted();
	return output.join("\n");
}

export default gameInfo;

if (import.meta.main) {
	console.log(
		await gameInfo(Deno.args[0], { outputType: MarkupType.Terminal }),
	);
}
