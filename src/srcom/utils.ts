#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import type { Format, MarkupType } from "./fmt.ts";
import type { SpeedrunCom, SpeedrunComUnofficial } from "./types.d.ts";
import { delay, TimeDelta } from "../../deps_general.ts";
export const SRC_API = "https://www.speedrun.com/api/v1";

export interface Opts {
	outputType?: MarkupType;
}

interface ApiArrayResponse {
	data: unknown[];
	pagination: {
		size: number;
		max: number;
		offset: number;
		links: {
			rel: "next" | "prev";
			uri: string;
		}[];
	};
}

export class CommandError extends Error {}

export async function getUser(
	query: string,
): Promise<SpeedrunCom.User | false> {
	if (!query.length) return false;
	let res: Response;
	res = await fetch(`${SRC_API}/users?lookup=${encodeURI(query)}`);
	const data = (await res.json()).data as SpeedrunCom.User[];
	if (res.ok && data[0]) return data[0];
	else {
		res = await fetch(`${SRC_API}/users/${encodeURI(query)}`);
		const data = (await res.json()).data as SpeedrunCom.User;
		return (res.ok && data) ? data : false;
	}
}

export async function getGame(
	query: string,
): Promise<SpeedrunCom.Game | false> {
	if (!query.length) return false;
	let res: Response;
	res = await fetch(`${SRC_API}/games?abbreviation=${query}`);
	const data = (await res.json()).data as SpeedrunCom.Game[];
	if (data[0]) return data[0];
	else {
		res = await fetch(`${SRC_API}/games?name=${query}`);
		const data = (await res.json()).data as SpeedrunCom.Game[];
		if (data[0]) return data[0];
		else {
			res = await fetch(`${SRC_API}/games/${query}`);
			const data = (await res.json()).data as SpeedrunCom.Game;
			if (data) return data;
		}
	}
	return false;
}

export async function getGames(games: string[]): Promise<SpeedrunCom.Game[]> {
	// The filter function should filter out all the `false` stuff.
	// Trust me bro I got this
	return (await Promise.all(games.filter((game) => !!game).map(getGame)))
		.filter((game) => !!game) as SpeedrunCom.Game[];
}

export async function getUsers(users: string[]): Promise<SpeedrunCom.User[]> {
	// The filter function should filter out all the `false` stuff.
	// Trust me bro I got this
	return (await Promise.all(users.filter((usr) => !!usr).map(getUser))).filter((
		user,
	) => !!user) as SpeedrunCom.User[];
}

export async function getAll<T>(url: URL | string): Promise<T[]> {
	url = new URL(url.toString());
	url.searchParams.set("max", "200");
	let data: unknown[] = [];
	let size = 0;
	let tmpSize;
	let attempts = 0;
	do {
		url.searchParams.set("offset", size.toString());
		const res = await fetch(url.toString());
		if (!res.ok) {
			if (res.status === 420) {
				console.warn("We are being throttled " + res.status);
				attempts++;
				if (attempts > 5) break;
				await delay(30_000);
			}
			continue;
		} else attempts = 0;
		const resJSON = await res.json() as ApiArrayResponse;
		data = data.concat(resJSON.data);
		size += resJSON.pagination.size;
		tmpSize = resJSON.pagination.size;
	} while (tmpSize === 200);
	return data as T[];
}

/**
 * This function uses an unofficial API to get a user's stats
 * It will throw if anything bad happens
 * @param userId A speedrun.com user ID
 * @returns It should return `SpeedrunComUnofficial.Stats` but it is actually `unknown`.
 * Be ready to catch any errors thrown with the returned object
 */
export async function unofficialGetUserStats(
	userId: string,
): Promise<SpeedrunComUnofficial.Stats> {
	const res = await fetch(
		"https://www.speedrun.com/_fedata/user/stats?" + new URLSearchParams({
			userId,
			ver: "3",
		}),
	);
	const data = await res.json();
	return data;
}

export function sec2time(timeInSeconds: number): string {
	const time = new TimeDelta({ seconds: timeInSeconds });
	return `${time}`.replaceAll(
		"000",
		"",
	);
}

// Adapted from
// https://github.com/Mango0x45/speedrunbot-plusplus/blob/38a7231805c966d55b1e23cd7e94a7ddd042088e/src/srcom/utils.py.m4#L248
export function getCategoryObj<
	T extends (SpeedrunCom.Category | SpeedrunCom.Level)[],
>(
	categoryName: string,
	categories: T,
): SpeedrunCom.Category | SpeedrunCom.Level | false {
	const category = categoryName.toLowerCase();
	for (const cat of categories) {
		if (cat.name.toLocaleLowerCase() == category) {
			return cat;
		}
	}
	return false;
}

type ExtensiveRun = SpeedrunCom.Run & {
	category: {
		data: SpeedrunCom.Category;
	};
	level: {
		data: SpeedrunCom.Level;
	};
	players: { data: SpeedrunCom.User[] };
};

export function formatRun(
	run: ExtensiveRun,
	fmt: Format,
): string {
	return `${
		run.level?.data.name || run.category?.data.name
			? fmt.link(
				run.weblink,
				fmt.bold(run.level?.data.name || run.category.data.name),
			) + " in"
			: run.weblink
	} ${sec2time(run.times.primary_t)} by ${
		run.players.data
			? (run.players
				.data as (
					| (SpeedrunCom.User & { rel: "user" })
					| (SpeedrunCom.Guest & { rel: "guest" })
				)[]).map((p) =>
					`${
						fmt.link(
							p.rel === "guest" ? p.links[0].uri : p.names.international,
							p.rel === "guest" ? p.name : p.names.international,
						)
					}`
				).join(" and ")
			: "no one :("
	}`;
}

export const statuses = ["new", "verified", "rejected"];

export async function getAllRuns(
	users: undefined | SpeedrunCom.User[],
	games: undefined | SpeedrunCom.Game[],
	status: undefined | string,
	examiners: undefined | SpeedrunCom.User[],
	emulated: undefined | string | boolean,
): Promise<ExtensiveRun[]> {
	const url = new URL(`${SRC_API}/runs?embed=game,category,level,players`);

	if (status) url.searchParams.set("status", status);
	if (typeof emulated !== "undefined") {
		if (["1", "yes", "true", true].includes(emulated)) {
			url.searchParams.set("emulated", "true");
			emulated = true;
		} else {
			url.searchParams.set("emulated", "false");
			emulated = false;
		}
	}

	const tasks: Promise<ExtensiveRun[]>[] = [];

	// TODO: Less duplication here please
	if (games && games.length) {
		for (const game of games) {
			if (users && users.length) {
				for (const user of users) {
					if (examiners && examiners.length) {
						for (const examiner of examiners) {
							url.searchParams.set("game", game.id);
							url.searchParams.set("user", user.id);
							url.searchParams.set("examiner", examiner.id);
							tasks.push(getAll<ExtensiveRun>(url));
						}
					} else {
						url.searchParams.set("game", game.id);
						url.searchParams.set("user", user.id);
						tasks.push(getAll<ExtensiveRun>(url));
					}
				}
			} else if (examiners && examiners.length) {
				for (const examiner of examiners) {
					url.searchParams.set("game", game.id);
					url.searchParams.set("examiner", examiner.id);
					tasks.push(getAll<ExtensiveRun>(url));
				}
			} else {
				url.searchParams.set("game", game.id);
				tasks.push(getAll<ExtensiveRun>(url));
			}
		}
	} else if (users && users.length) {
		for (const user of users) {
			if (examiners && examiners.length) {
				for (const examiner of examiners) {
					url.searchParams.set("user", user.id);
					url.searchParams.set("examiner", examiner.id);
					tasks.push(getAll<ExtensiveRun>(url));
				}
			} else {
				url.searchParams.set("user", user.id);
				tasks.push(getAll<ExtensiveRun>(url));
			}
		}
	} else if (examiners && examiners.length) {
		for (const examiner of examiners) {
			url.searchParams.set("examiner", examiner.id);
			tasks.push(getAll<ExtensiveRun>(url));
		}
	}
	return (await Promise.all(tasks)).flat();
}

export function getUsersGamesExaminers(
	user?: string,
	game?: string,
	examiner?: string,
): Promise<[SpeedrunCom.User[], SpeedrunCom.Game[], SpeedrunCom.User[]]> {
	return Promise.all([
		getUsers((user ? user.split(",") : []).filter((a) => !!a)),
		getGames((game ? game.split(",") : []).filter((a) => !!a)),
		getUsers((examiner ? examiner.split(",") : []).filter((a) => !!a)),
	]);
}
