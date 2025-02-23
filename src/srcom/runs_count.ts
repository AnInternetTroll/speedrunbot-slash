#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-import=git.sr.ht,esm.sh,deno.land,raw.githubusercontent.com,jsr.io --allow-read --no-check --no-prompt --location=http://speedrunbot-slash/
import { Format, MarkupType } from "./fmt.ts";
import {
	CommandError,
	getAllRuns,
	getUsersGamesExaminers,
	statuses,
} from "./utils.ts";
import type { Opts } from "./utils.ts";

export async function runsCount(
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
	let fullGameRuns = 0;
	let individualLevelRuns = 0;
	let verifiedRuns = 0;
	let rejectedRuns = 0;
	const gameCount: Record<string, number> = {};

	runs.forEach((run) => {
		if (
			typeof run.level === "string" || typeof run.level.data.name === "string"
		) {
			individualLevelRuns++;
		} else fullGameRuns++;
		if (games.length && games.length !== 1) {
			const gameId = run.game;
			if (isNaN(gameCount[gameId])) gameCount[gameId] = 1;
			else gameCount[gameId]++;
		}
		if (run.status.status === "verified") verifiedRuns++;
		else if (run.status.status === "rejected") rejectedRuns++;
	});
	output.push(
		`Run Count:${
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

	output.push(`${fmt.bold("Fullgame")}: ${fullGameRuns}`);
	output.push(`${fmt.bold("Individual Level")}: ${individualLevelRuns}`);

	if (Object.keys(gameCount).length) {
		output.push("");
		for (const game in gameCount) {
			output.push(
				`${
					fmt.bold(
						games.find((gameObj) => gameObj.id === game)!.names.international,
					)
				}: ${gameCount[game]}`,
			);
		}
		output.push("");
	}

	if (examiners.length && !status) {
		output.push("");
		output.push(`Verified: ${verifiedRuns.toString()}`);
		output.push(`Rejected: ${rejectedRuns.toString()}`);
		output.push("");
	}

	output.push(`${fmt.bold("Total")}: ${fullGameRuns + individualLevelRuns}`);

	signal?.throwIfAborted();
	return output.join("\n");
}

if (import.meta.main) {
	const [users, games, status, examiner, emulated] = Deno.args;
	try {
		console.log(
			await runsCount(users, games, status, examiner, emulated, {
				outputType: MarkupType.Terminal,
			}),
		);
	} catch (err) {
		if (err instanceof CommandError) console.error("Error:", err.message);
		else console.log("Unexpected Error:", err);
	}
}
