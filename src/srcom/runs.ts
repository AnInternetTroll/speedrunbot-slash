#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-import=git.sr.ht,esm.sh,deno.land,raw.githubusercontent.com,jsr.io --allow-read --no-check --no-prompt --location=http://speedrunbot-slash/
import { Format, MarkupType } from "./fmt.ts";
import {
	CommandError,
	formatRun,
	getAllRuns,
	getUsersGamesExaminers,
	statuses,
} from "./utils.ts";
import type { Opts } from "./utils.ts";

export async function runs(
	user?: string,
	game?: string,
	status?: string,
	examiner?: string,
	emulated?: boolean | string,
	{ outputType = MarkupType.Markdown, signal }: Opts = {},
): Promise<string> {
	if (!user && !game && !examiner) {
		throw new CommandError("A user or a game is required.");
	}

	const [users, games, examiners] = await getUsersGamesExaminers(
		user,
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

	const fmt = new Format(outputType);
	const output: string[] = [];

	const runs = await getAllRuns(users, games, status, examiners, emulated, {
		signal,
	});

	output.push(
		`Runs:${
			users.length
				? " " + users.map((user) => user.names.international).join(" and ")
				: ""
		}${
			games.length
				? " - " + games.map((game) => game.names.international).join(" and ")
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
		}${
			typeof emulated === "boolean"
				? (emulated === true
					? " Played on an emulator"
					: " Not played on an emulator")
				: ""
		}`,
	);
	if (runs.length) {
		runs.forEach((run) => {
			output.push(
				formatRun(run, fmt),
			);
		});
	} else output.push("No runs found");
	return output.join("\n");
}

if (import.meta.main) {
	const [users, games, status, examiner, emulated] = Deno.args;
	try {
		console.log(
			await runs(users, games, status, examiner, emulated, {
				outputType: MarkupType.Terminal,
			}),
		);
	} catch (err) {
		if (err instanceof CommandError) console.error("Error:", err.message);
		else console.log("Unexpected Error:", err);
	}
}
