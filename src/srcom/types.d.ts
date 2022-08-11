// deno-lint-ignore-file no-explicit-any
export namespace SpeedrunCom {
	export interface Names {
		international: string;
		japanese: string | null;
		twitch?: string;
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
		rel?: string;
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

	export interface Videos {
		links: Link[];
		text?: string;
	}

	export interface Status {
		status: "verified" | "rejected" | "new";
		examiner?: any;
		"verify-date"?: any;
	}

	export type Player =
		| (SpeedrunCom.User & { rel: "user" })
		| (SpeedrunCom.Guest & { rel: "guest" });

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

	interface Guest {
		name: string;
		links: Link[];
	}

	export interface Run {
		id: string;
		weblink: string;
		game: string;
		level?: any;
		category: string;
		videos: Videos | null;
		comment: string;
		status: Status;
		players: (Player | Guest & { rel: "guest" })[];
		date: string;
		submitted?: any;
		times: Times;
		system: System;
		splits?: any;
		values: Values;
		links: Link[];
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
		[modId: string]: "super-moderator" | "moderator";
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

	export interface Game {
		id: string;
		names: GameNames;
		abbreviation: string;
		weblink: string;
		released: number;
		// This will always be a string
		// Regardless on weather the game moderators have set a discord or not
		// But if they did not set it then it will be an empty string (`""`)
		// As such let's pretend that it can be `undefined`
		discord?: string;
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

	export interface Category {
		id: string;
		name: string;
		weblink: string;
		type: "per-level" | "per-game";
		rules: string;
		players: Players;
		miscellaneous: boolean;
		links: Link[];
	}

	export interface Level {
		id: string;
		name: string;
		weblink: string;
		rules: string | null;
		links: Link[];
	}

	export interface Scope {
		type: string;
	}

	export interface Variable {
		id: string;
		name: string;
		category?: any;
		scope: Scope;
		mandatory: boolean;
		"user-defined": boolean;
		obsoletes: boolean;
		values: {
			values: {
				[k: string]: {
					label: string;
					rules: string;
					flags: {
						miscellaneous: boolean;
					};
				};
			};
			default: string;
		};
		"is-subcategory": boolean;
		links: Link[];
	}

	export interface Leaderboard {
		weblink: string;
		game: string;
		category: string;
		level?: any;
		platform?: any;
		region?: any;
		emulators?: any;
		"video-only": boolean;
		timing: string;
		values: Values;
		runs: {
			place: number;
			run: Run;
		}[];
		links: Link[];
	}

	export interface Platform {
		id: string;
		name: string;
		released: number;
		links: Link[];
	}

	export interface Genre {
		id: string;
		name: string;
		links: Link[];
	}
}

export namespace SpeedrunComUnofficial {
	export interface Color {
		id: number;
		name: string;
		pos: number;
		darkColor: string;
		lightColor: string;
	}

	export interface User {
		id: string;
		url: string;
		name: string;
		pronouns: string;
		powerLevel: number;
		color1: Color;
		color2: Color;
		signupDate: number;
		lastOnline: number;
		avatarPath: string;
		hasDonated: boolean;
		donated: number;
		coin: number;
		isGameModerator: boolean;
		isTranslator: boolean;
		bio: string;
	}

	export interface UserStats {
		totalRuns: number;
		totalRunTime: number;
		minRunDate: number;
		maxRunDate: number;
		totalCommentLikesGiven: number;
		totalCommentLikesReceived: number;
		totalComments: number;
		minCommentDate: number;
		maxCommentDate: number;
		guidesCreated: number;
		resourcesCreated: number;
	}

	export interface Game {
		id: string;
		url: string;
		name: string;
		type: string;
		loadtimes: boolean;
		milliseconds: boolean;
		igt: boolean;
		verification: boolean;
		requireVideo: boolean;
		autoVerify: boolean;
		emulator: number;
		defaultTimer: number;
		releaseDate: number;
		addedDate: number;
		touchDate: number;
		runCommentsMode: number;
		coverPath: string;
		trophy1stPath: string;
		trophy2ndPath: string;
		trophy3rdPath: string;
		trophy4thPath: string;
	}

	export interface GameStat {
		game: Game;
		totalRuns: number;
		totalTime: number;
		uniqueLevels: number;
		uniqueCategories: number;
		minDate: number;
		maxDate: number;
	}

	export interface Game {
		id: string;
		url: string;
		name: string;
		type: string;
		loadtimes: boolean;
		milliseconds: boolean;
		igt: boolean;
		verification: boolean;
		requireVideo: boolean;
		autoVerify: boolean;
		emulator: number;
		defaultTimer: number;
		releaseDate: number;
		addedDate: number;
		touchDate: number;
		runCommentsMode: number;
		coverPath: string;
		trophy1stPath: string;
		trophy2ndPath: string;
		trophy3rdPath: string;
		trophy4thPath: string;
	}

	export interface ModStat {
		game: Game;
		level: number;
		totalRuns: number;
		totalTime: number;
		minDate: number;
		maxDate: number;
	}

	export interface FollowStat {
		game: Game;
		pos: number;
		accessCount: number;
		lastAccessDate: number;
	}

	export interface Stats {
		user: User;
		userStats: UserStats;
		followStats: FollowStat[];
		gameStats: GameStat[];
		modStats: ModStat[];
	}
}
