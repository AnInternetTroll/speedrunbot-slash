#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import type { Format, MarkupType } from "./fmt.ts";
import type { SpeedrunCom, SpeedrunComUnofficial } from "./types.d.ts";
import { delay, TimeDelta } from "../../deps_general.ts";
export const SRC_URL = "https://www.speedrun.com";
export const SRC_API = `${SRC_URL}/api/v1`;

export interface Opts {
	outputType?: MarkupType;
	signal?: AbortSignal;
}

type ApiData = {
	id: string;
};

interface ApiArrayResponse {
	data: (ApiData & unknown)[];
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
export class SpeedrunComError extends Error {}

export async function fetch(
	input: string | URL | Request,
	init?: RequestInit | undefined,
): Promise<Response> {
	const res = await globalThis.fetch(input, {
		...init,
		headers: {
			...init?.headers,
			"User-Agent": "aninternettroll/speedrunbot-slash",
		},
	});
	if (res.status >= 500) {
		throw new SpeedrunComError(`Speedrun.com panicked ${res.status}`);
	} else {
		return res;
	}
}

export async function getUser(
	query: string,
	{ signal }: { signal?: AbortSignal } = {},
): Promise<SpeedrunCom.User | false> {
	if (!query.length) return false;
	let res: Response;
	res = await fetch(`${SRC_API}/users?lookup=${encodeURI(query)}`, { signal });
	const data = (await res.json()).data as SpeedrunCom.User[];
	if (res.ok && data[0]) return data[0];
	else {
		res = await fetch(`${SRC_API}/users/${encodeURI(query)}`, { signal });
		const data = (await res.json()).data as SpeedrunCom.User;
		return (res.ok && data) ? data : false;
	}
}

export async function getGame(
	query: string,
	{ signal }: { signal?: AbortSignal } = {},
): Promise<SpeedrunCom.Game | false> {
	if (!query.length) return false;
	let res: Response;
	res = await fetch(`${SRC_API}/games?abbreviation=${query}`, { signal });
	const data = (await res.json()).data as SpeedrunCom.Game[];
	if (data[0]) return data[0];
	else {
		res = await fetch(`${SRC_API}/games?name=${query}`, { signal });
		const data = (await res.json()).data as SpeedrunCom.Game[];
		if (data[0]) return data[0];
		else {
			res = await fetch(`${SRC_API}/games/${query}`, { signal });
			const data = (await res.json()).data as SpeedrunCom.Game;
			if (data) return data;
		}
	}
	return false;
}

export async function getGames(
	games: string[],
	{ signal }: { signal?: AbortSignal } = {},
): Promise<SpeedrunCom.Game[]> {
	// The filter function should filter out all the `false` stuff.
	// Trust me bro I got this
	return (await Promise.all(
		games.filter((game) => !!game).map((game) => getGame(game, { signal })),
	))
		.filter((game) => !!game) as SpeedrunCom.Game[];
}

export async function getUsers(
	users: string[],
	{ signal }: { signal?: AbortSignal } = {},
): Promise<SpeedrunCom.User[]> {
	// The filter function should filter out all the `false` stuff.
	// Trust me bro I got this
	return (await Promise.all(
		users.filter((usr) => !!usr).map((username) =>
			getUser(username, { signal })
		),
	)).filter((
		user,
	) => !!user) as SpeedrunCom.User[];
}

export async function getAll<T extends ApiData>(
	url: URL | string,
	{ signal, lastId }: { signal?: AbortSignal; lastId?: string } = {},
): Promise<T[]> {
	url = new URL(url.toString());
	if (url.pathname.startsWith("/api/v1/runs")) {
		url.searchParams.set("orderby", "date");
	}
	if (url.pathname.startsWith("/api/v1/games")) {
		url.searchParams.set("orderby", "released");
	}

	if (lastId) {
		url.searchParams.set("direction", "desc");
	}

	url.searchParams.set("max", "200");
	let data: ApiData[] = [];
	let size = 0;
	let tmpSize;
	let attempts = 0;
	do {
		signal?.throwIfAborted();
		url.searchParams.set("offset", size.toString());
		const res = await fetch(url.toString(), { signal });
		if (!res.ok) {
			if (res.status === 420) {
				console.warn("We are being throttled " + res.status);
				attempts++;
				if (attempts > 5) break;
				await delay(30_000);
			} else if (res.status === 400) {
				const body = await res.json();
				// Above 10k speedrun.com just breaks
				// With this error message
				if (body.message === "Invalid pagination values.") {
					lastId = data.at(-1)?.id;
					break;
				} else {
					// This is an unexpected error
					// So try to walk it off
					break;
				}
			}
			continue;
		} else attempts = 0;
		const resJSON = await res.json() as ApiArrayResponse;
		const lastIdIndex = resJSON.data.findIndex((entry) => {
			return entry.id === lastId;
		});
		const lastIdFound = lastIdIndex !== -1;
		data = data.concat(
			lastIdFound ? resJSON.data.slice(-(lastIdIndex)) : resJSON.data,
		);
		if (lastIdFound) {
			lastId = undefined;
			break;
		}
		size += resJSON.pagination.size;
		tmpSize = resJSON.pagination.size;
	} while (tmpSize === 200);
	if (lastId) data = data.concat(await getAll<T>(url, { signal, lastId }));

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
		`${SRC_URL}/_fedata/user/stats?${new URLSearchParams({
			userId,
			ver: "3",
		})}`,
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
	{ signal }: { signal?: AbortSignal } = {},
): Promise<ExtensiveRun[]> {
	const url = new URL(`${SRC_API}/runs?embed=category,level,players`);

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
							tasks.push(getAll<ExtensiveRun>(url, { signal }));
						}
					} else {
						url.searchParams.set("game", game.id);
						url.searchParams.set("user", user.id);
						tasks.push(getAll<ExtensiveRun>(url, { signal }));
					}
				}
			} else if (examiners && examiners.length) {
				for (const examiner of examiners) {
					url.searchParams.set("game", game.id);
					url.searchParams.set("examiner", examiner.id);
					tasks.push(getAll<ExtensiveRun>(url, { signal }));
				}
			} else {
				url.searchParams.set("game", game.id);
				tasks.push(getAll<ExtensiveRun>(url, { signal }));
			}
		}
	} else if (users && users.length) {
		for (const user of users) {
			if (examiners && examiners.length) {
				for (const examiner of examiners) {
					url.searchParams.set("user", user.id);
					url.searchParams.set("examiner", examiner.id);
					tasks.push(getAll<ExtensiveRun>(url, { signal }));
				}
			} else {
				url.searchParams.set("user", user.id);
				tasks.push(getAll<ExtensiveRun>(url, { signal }));
			}
		}
	} else if (examiners && examiners.length) {
		for (const examiner of examiners) {
			url.searchParams.set("examiner", examiner.id);
			tasks.push(getAll<ExtensiveRun>(url, { signal }));
		}
	}
	signal?.throwIfAborted();
	return (await Promise.all(tasks)).flat();
}

export function getUsersGamesExaminers(
	user?: string,
	game?: string,
	examiner?: string,
	{ signal }: { signal?: AbortSignal } = {},
): Promise<[SpeedrunCom.User[], SpeedrunCom.Game[], SpeedrunCom.User[]]> {
	return Promise.all([
		getUsers((user ? user.split(",") : []).filter((a) => !!a), { signal }),
		getGames((game ? game.split(",") : []).filter((a) => !!a), { signal }),
		getUsers((examiner ? examiner.split(",") : []).filter((a) => !!a), {
			signal,
		}),
	]);
}

interface GameBulk {
	id: string;
	names: SpeedrunCom.Names;
	abbreviation: string;
	weblink: string;
}

export async function searchGames(name: string): Promise<{
	name: string;
	abbreviation: string;
}[]> {
	// This is super un official way and can break at any time
	// Which is why we fall back on the normal API
	try {
		if (name.length <= 2) throw new Error("shortName");
		const gamesRes = await fetch(
			`${SRC_URL}/ajax_search.php?type=games&showall=true&term=${
				encodeURIComponent(name)
			}`,
		);
		if (!gamesRes.ok) {
			throw new Error(`Got an unexpected status: ${gamesRes.status}`);
		}
		const games = await gamesRes.json() as {
			label: string;
			url: string;
			category: string;
		}[];
		return games.map((game) => ({
			name: game.label,
			abbreviation: game.url,
		}));
	} catch (err: unknown) {
		if (!(err instanceof Error && err.message === "shortName")) {
			console.error(err);
		}
		const gamesRes = await fetch(
			`${SRC_API}/games?name=${name}&_bulk=true&max=20`,
		);
		if (!gamesRes.ok) {
			throw new Error(`Got an unexpected status: ${gamesRes.status}`);
		}
		const games = (await gamesRes.json()).data as GameBulk[];
		return games.map((game) => ({
			name: game.names.international,
			abbreviation: game.abbreviation,
		}));
	}
}

export async function searchUsers(name: string): Promise<{
	name: string;
}[]> {
	if (!name) return [];
	const output: { name: string }[] = [];
	let shortName: Promise<{ name: string } | false> | false = false;

	if (name.length <= 2) {
		shortName = fetch(`${SRC_API}/users?lookup=${encodeURIComponent(name)}`)
			.then((res) => res.json()).then((user: { data: SpeedrunCom.User[] }) => ({
				name: user.data[0].names.international,
			}), (_) => false);
	}

	// This is super un official way and can break at any time
	// Which is why we fall back on the normal API
	try {
		if (name.length <= 1) throw new Error("Short name");
		const usersRes = await fetch(
			`${SRC_URL}/ajax_search.php?type=users&showall=true&term=${
				encodeURIComponent(name)
			}`,
		);
		if (!usersRes.ok) {
			throw new Error(`Got an unexpected status: ${usersRes.status}`);
		}
		const users = await usersRes.json() as {
			label: string;
			url: string;
			category: string;
		}[];

		output.push(...users.map((user) => ({
			name: user.label,
		})));
	} catch (err: unknown) {
		if (!(err instanceof Error && err.message === "Short name")) {
			console.error(err);
		}
		const usersRes = await fetch(`${SRC_API}/users?name=${name}`);
		if (!usersRes.ok) {
			throw new Error(`Got an unexpected status: ${usersRes.status}`);
		}
		const users = (await usersRes.json()).data as SpeedrunCom.User[];
		output.push(...users.map((user) => ({
			name: user.names.international,
		})));
	}
	if (shortName) {
		const name = await shortName;
		if (name) output.splice(0, 0, name);
	}

	return output;
}
