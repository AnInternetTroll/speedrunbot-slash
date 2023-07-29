#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { MarkupType } from "./fmt.ts";
import {
	CommandError,
	getUsersGamesExaminers,
	SRC_API,
	statuses,
} from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";
import type { Opts } from "./utils.ts";

export const dateFormat = Intl.DateTimeFormat("en-uk", {
	day: "numeric",
	month: "long",
	year: "numeric",
	timeZone: "Europe/London",
}).format;

export async function latestActivity(
	game?: string,
	status?: string,
	examiner?: string,
	{ signal }: Opts = {},
): Promise<string> {
	if (!game && !examiner) {
		throw new CommandError("A user or a game is required.");
	}

	const [users, games, examiners] = await getUsersGamesExaminers(
		undefined,
		game,
		examiner,
		{ signal },
	);

	if (!users.length && !games.length && !examiners.length) {
		throw new CommandError(`User not found`);
	}

	if (status) {
		if (!Object.keys(statuses).includes(status)) {
			throw new CommandError(
				`Invalid status provided. The only valid status values are ${
					Object.keys(statuses).join(", ")
				}`,
			);
		}
	}

	const output: string[] = [];

	const runs: SpeedrunCom.Run[] = await fetch(
		`${SRC_API}/runs?${new URLSearchParams({
			game: games.at(0)?.id!,
			examiner: examiners.at(0)?.id!,
			orderby: "verify-date",
			max: "1",
		})}`,
	).then(r => r.json()).then(res => res.data);

	output.push(
		`Latest Activity: ${
			games.length
				? games.map((game) => game.names.international).join(" and ")
				: ""
		}${
			examiners.length
				? " Examined by " + examiners.map((user) =>
					user.names.international
				).join(" and ")
				: ""
		}${
			status?.length
				? ` - Status ${statuses[status as keyof (typeof statuses)]}`
				: ""
		}`,
	);
	if (runs.length) {
		const run = runs.at(0)!;
		output.push(`Last activity was on ${dateFormat(new Date(run.status["verify-date"] || run.date))}`)
	} else output.push("No activity found");
	return output.join("\n");
}

if (import.meta.main) {
	const [games, status, examiner] = Deno.args;
	try {
		console.log(
			await latestActivity(games, status, examiner, {
				outputType: MarkupType.Terminal,
			}),
		);
	} catch (err) {
		if (err instanceof CommandError) console.error("Error:", err.message);
		else console.log("Unexpected Error:", err);
	}
}
