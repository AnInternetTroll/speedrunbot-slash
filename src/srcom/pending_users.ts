#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import { Format } from "./fmt.ts";
import { CommandError, getAll, getUsers, sec2time, SRC_API } from "./utils.ts";
import type { Opts } from "./utils.ts";
import type { SpeedrunCom } from "./types.d.ts";

// @ts-ignore how are you supposed to do this?
interface Run extends SpeedrunCom.Run {
	category: {
		data: SpeedrunCom.Category;
	};
	level: {
		data: SpeedrunCom.Level;
	};
	players: { data: SpeedrunCom.User[] };
}

export async function pendingUsers(
	users: string[] = [],
	{ outputType = "markdown" }: Opts = {},
): Promise<string> {
	const fmt = new Format(outputType);
	const output: string[] = [];
	const url = new URL(
		`${SRC_API}/runs?status=new&embed=category,level,players`,
	);

	const urls: URL[] = [];
	const userObjs = await getUsers(users);

	if (!userObjs.length) throw new CommandError("No users found.");

	userObjs.forEach((user) => {
		url.searchParams.set("user", user.id);
		urls.push(url);
	});

	const runs = (await Promise.all(urls.map((url) => getAll<Run>(url)))).flat();

	output.push(`${fmt.bold("Pending")}: ${users.join(" and ")}`);
	if (outputType === "markdown") {
		runs.forEach((run) => {
			output.push(
				`[${
					run.level?.data.name ||
					run.category.data.name
				}](${run.weblink}) in \`${sec2time(run.times.primary_t)}\` by ${
					run.players.data.map((p) =>
						// @ts-ignore A user can be a guest
						`[${p.rel === "guest" ? p.name : p.names.international}](${
							// @ts-ignore A user can be a guest
							p.rel === "guest"
								// @ts-ignore A user can be a guest
								? p.uri
								: p.weblink
						})`
					).join(" and ")
				}`,
			);
		});
	} else {
		runs.forEach((run) => {
			output.push(
				`${run.level?.data.name || run.category.data.name} in ${
					sec2time(run.times.primary_t)
				} by ${
					run.players.data.map((p) =>
						// @ts-ignore A user can be a guest
						p.rel === "guest" ? p.name : p.names.international
					).join(" and ")
				}`,
			);
		});
	}
	return output.join("\n");
}

if (import.meta.main) {
	console.log(await pendingUsers(Deno.args, { outputType: "markdown" }));
}
