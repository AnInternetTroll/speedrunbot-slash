#!/usr/bin/env -S deno run --allow-net=www.speedrun.com --allow-env=NO_COLOR --no-check
import type { MarkupType } from "./fmt.ts";
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
		const res = await fetch(url);
		if (!res.ok) {
			if (res.status === 420) {
				console.warn("We are being throttled " + res.status);
				attempts++;
				if (attempts > 5) break;
				await delay(90000);
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
	return new TimeDelta({ seconds: timeInSeconds }).toString().replaceAll(
		"000",
		"",
	);
}
