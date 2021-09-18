// deno-lint-ignore-file camelcase no-explicit-any
export namespace SpeedrunCom {
	export interface Names {
		international: string;
		japanese?: string;
	}

	export interface ColorFrom {
		light: string;
		dark: string;
	}

	export interface ColorTo {
		light: string;
		dark: string;
	}

	export interface NameStyle {
		style: string;
		"color-from": ColorFrom;
		"color-to": ColorTo;
	}

	export interface Country {
		code: string;
		names: Names;
	}

	export interface Region {
		code: string;
		names: Names;
	}

	export interface Location {
		country: Country;
		region: Region;
	}

	export interface ExternalAccount {
		uri: string;
	}

	export interface Icon {
		uri: string;
	}

	export interface Image {
		uri: string;
	}

	export interface Assets {
		icon: Icon;
		image: Image;
	}

	export interface Link {
		rel: string;
		uri: string;
	}

	export interface User {
		id: string;
		names: Names;
		pronouns: string;
		weblink: string;
		"name-style": NameStyle;
		role: string;
		signup: Date;
		location: Location;
		twitch: ExternalAccount;
		hitbox?: ExternalAccount;
		youtube: ExternalAccount;
		twitter?: ExternalAccount;
		speedrunslive?: ExternalAccount;
		assets: Assets;
		links: Link[];
	}

	export interface Link {
		uri: string;
	}

	export interface Videos {
		links: Link[];
	}

	export interface Status {
		status: "verified" | "rejected" | "new";
		examiner?: any;
		"verify-date"?: any;
	}

	export interface Player {
		rel: string;
		id: string;
		uri: string;
	}

	export interface Times {
		primary: string;
		primary_t: number;
		realtime: string;
		realtime_t: number;
		realtime_noloads?: number;
		realtime_noloads_t: number;
		ingame?: number;
		ingame_t: number;
	}

	export interface System {
		platform?: any;
		emulated: boolean;
		region: string;
	}

	export type Values = any;

	export interface Link2 {
		rel: string;
		uri: string;
	}

	export interface Run {
		id: string;
		weblink: string;
		game: string;
		level?: any;
		category: string;
		videos: Videos;
		comment: string;
		status: Status;
		players: Player[];
		date: string;
		submitted?: any;
		times: Times;
		system: System;
		splits?: any;
		values: Values;
		links: Link2[];
	}

	export interface GameNames {
		international: string;
		japanese?: any;
		twitch: string;
	}

	export interface Ruleset {
		"show-milliseconds": boolean;
		"require-verification": boolean;
		"require-video": boolean;
		"run-times": string[];
		"default-time": string;
		"emulators-allowed": boolean;
	}

	export interface Moderators {
		[modId: string]: string;
	}

	export interface Logo {
		uri: string;
	}

	export interface CoverTiny {
		uri: string;
	}

	export interface CoverSmall {
		uri: string;
	}

	export interface CoverMedium {
		uri: string;
	}

	export interface CoverLarge {
		uri: string;
	}

	export interface Icon {
		uri: string;
	}

	export interface Trophy1st {
		uri: string;
	}

	export interface Trophy2nd {
		uri: string;
	}

	export interface Trophy3rd {
		uri: string;
	}

	export interface Trophy4th {
		uri: string;
	}

	export interface Background {
		uri: string;
	}

	export interface Foreground {
		uri?: any;
	}

	export interface Assets {
		logo: Logo;
		"cover-tiny": CoverTiny;
		"cover-small": CoverSmall;
		"cover-medium": CoverMedium;
		"cover-large": CoverLarge;
		icon: Icon;
		"trophy-1st": Trophy1st;
		"trophy-2nd": Trophy2nd;
		"trophy-3rd": Trophy3rd;
		"trophy-4th": Trophy4th;
		background: Background;
		foreground: Foreground;
	}

	export interface Link {
		rel: string;
		uri: string;
	}

	export interface Game {
		id: string;
		names: GameNames;
		abbreviation: string;
		weblink: string;
		released: number;
		"release-date": string;
		ruleset: Ruleset;
		romhack: boolean;
		gametypes: any[];
		platforms: string[];
		regions: any[];
		genres: string[];
		engines: string[];
		developers: string[];
		publishers: string[];
		moderators: Moderators;
		created: Date;
		assets: Assets;
		links: Link[];
	}

	export interface Players {
		type: string;
		value: number;
	}

	export interface Link {
		rel: string;
		uri: string;
	}

	export interface Category {
		id: string;
		name: string;
		weblink: string;
		type: string;
		rules: string;
		players: Players;
		miscellaneous: boolean;
		links: Link[];
	}

	export interface Level {
		id: string;
		name: string;
		weblink: string;
		rules: string;
		links: Link[];
	}
}
