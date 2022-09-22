#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format, MarkupType } from "./fmt.ts";
import { CommandError, fetch, getUser, sec2time, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import { SpeedrunCom } from "./types.d.ts";

export const dateFormat = Intl.DateTimeFormat("en-uk", {
	day: "numeric",
	month: "long",
	year: "numeric",
	timeZone: "Europe/London",
}).format;

export async function runInfo(
	run: string,
	{ outputType = MarkupType.Markdown, signal }: Opts = {},
): Promise<string> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	if (!run) throw new CommandError("No run found");

	const runRequest = await fetch(
		`${SRC_API}/runs/${
			encodeURIComponent(run.split("/").at(-1)!)
		}?embed=players,game,category,level`,
		{ signal },
	);

	if (!runRequest.ok) {
		if (runRequest.status === 404) throw new CommandError("No run found");
		else throw new Error(await runRequest.text());
	}

	const runObj = (await runRequest.json()).data as SpeedrunCom.Run;

	let platform: { name: string; emulated: boolean } | null = null;
	if (runObj.system.platform) {
		const res = await fetch(`${SRC_API}/platforms/${runObj.system.platform}`, {
			signal,
		});
		const data = (await res.json()).data as SpeedrunCom.Platform;
		platform = { name: data.name, emulated: runObj.system.emulated };
	}

	const category =
		(runObj.category as unknown as { data: SpeedrunCom.Category }).data
			.name;
	const level = runObj.level
		? (runObj.level as unknown as { data: SpeedrunCom.Level }).data
			.name
		: null;
	const time = sec2time(runObj.times.primary_t);
	const game = (runObj.game as unknown as { data: SpeedrunCom.Game }).data.names
		.international;
	const playersObjs = (runObj.players as unknown as {
		data: (SpeedrunCom.User | SpeedrunCom.Guest)[];
	}).data;

	output.push(
		`${fmt.bold(category)} in ${time} by ${
			playersObjs.map((
				player,
			) =>
				// @ts-ignore If a `player` has `names` then it's a user account
				// Otherwise it's a guest
				player?.names ? player.names.international : player.name
			).join(
				" and ",
			)
		} - ${game}`,
	);

	output.push(`${fmt.bold("Run ID")}: ${runObj.id}`);

	output.push(
		`${fmt.bold("Status")}: ${runObj.status.status}${
			runObj.status.status !== "new"
				? (runObj.status.examiner
					? ` - ${
						(await getUser(runObj.status.examiner) as SpeedrunCom.User).names
							.international
					} on ${dateFormat(new Date(runObj.status["verify-date"]))}`
					: "")
				: ""
		}`,
	);

	if (runObj.date) {
		output.push(
			`${fmt.bold("Date")}: ${dateFormat(new Date(runObj.date))}`,
		);
	}

	if (level) output.push(`${fmt.bold("Level")}: ${level}`);

	output.push(
		`${fmt.bold("Category")}: ${
			(runObj.category as unknown as { data: SpeedrunCom.Category }).data.name
		}`,
	);
	if (platform) {
		output.push(
			`${fmt.bold("Platform")}: ${platform.name} ${
				platform.emulated ? "(Emulated)" : ""
			}`,
		);
	}

	output.push(
		`${fmt.bold(`Player${playersObjs.length > 1 ? "s" : ""}`)}: ${
			playersObjs.map((player) =>
				// @ts-ignore If a player has a weblink then they have an account
				// Otherwise they are a guest
				player?.weblink
					// @ts-ignore same thing
					? fmt.link(player.weblink, player.names.international)
					// @ts-ignore same thing
					: player.name
			).join(" and ")
		}`,
	);

	if (runObj.videos?.text) {
		output.push(`${fmt.bold("Video text")}: ${runObj.videos.text}`);
	}

	output.push(
		`${
			fmt.bold(`Video${
				(runObj.videos && runObj.videos.links)
					? runObj.videos.links.length > 1 ? "s" : ""
					: ""
			}`)
		}: ${
			(runObj.videos && runObj.videos.links)
				? runObj.videos.links.map((link) => link.uri).join(" and ")
				: "No video :("
		}`,
	);
	output.push(`${fmt.link(runObj.weblink, fmt.bold("Web link"))}`);

	signal?.throwIfAborted();
	return output.join("\n");
}

export default runInfo;

if (import.meta.main) {
	console.log(await runInfo(Deno.args[0], { outputType: MarkupType.Terminal }));
}
