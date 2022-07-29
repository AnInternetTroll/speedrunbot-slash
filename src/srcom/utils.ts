#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import type { MarkupType } from "./fmt.ts";
import type { SpeedrunCom, SpeedrunComUnofficial } from "./types.d.ts";
import { delay } from "../../deps_general.ts";
import { fetchJSON } from "../utils.ts";
export const SRC_URL = "https://www.speedrun.com";
export const SRC_API = `${SRC_URL}/api/v1`;

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
	const user = (await fetchJSON(`${SRC_API}/users/${query}`)).data as SpeedrunCom.User;
	if (user) return user;
	return (await fetchJSON(`${SRC_API}/users?name=${query}&max=1`)).data[0] as SpeedrunCom.User || false;
}

export async function getGame(
	query: string,
): Promise<SpeedrunCom.Game | false> {
	if (!query.length) return false;
	const game = (await fetchJSON(`${SRC_API}/games/${query}`)).data as SpeedrunCom.Game;
	if (game) return game;
	return (await fetchJSON(`${SRC_API}/games?name=${query}&max=1`)).data[0] as SpeedrunCom.Game || false;
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
		`${SRC_URL}/_fedata/user/stats?${new URLSearchParams({
			userId,
			ver: "3",
		})}`,
	);
	return await res.json();
}

export function sec2time(timeInSeconds: number): string {
	//Stolen from speedrun.com
	let t = timeInSeconds || 0;
	const n = Math.floor(t / 3600);
	t = t - n * 3600;
	const r = Math.floor(t / 60);
	t = t - r * 60;
	const i = Math.floor(t);
	t = t - i;
	const a = Math.round(t * 1e3),
		o = [];
	n > 0 && o.push(n.toString()),
		o.push(r.toString().padStart(1, "0")),
		o.push(i.toString().padStart(2, "0"));
	let s = o.join(":");
	if (a > 0) s += `.${a.toString().padStart(3, "0")}`;
	return s;
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
