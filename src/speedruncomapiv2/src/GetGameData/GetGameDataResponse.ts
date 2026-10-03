import { Game } from "../types/game.ts";
import { StaticAsset } from "../types/staticAsset.ts";
import { User } from "../types/user.ts";
import { ModeratorType } from "../types/ModeratorType.ts";
import { Level } from "../types/Level.ts";
import { Platform } from "../types/Platform.ts";
import { Value } from "../types/Value.ts";
import { Variable } from "../types/Variable.ts";

export interface GetGameDataResponse {
	game: Game;
	categories: {
		id: string;
		name: string;
		url: string;
		pos: number;
		gameId: string;
		isMisc: boolean;
		isPerLevel: boolean;
		numPlayers: number;
		exactPlayers: boolean;
		// TODO Enum
		playerMatchMode: number;
		// TODO Enum
		timeDirection: number;
		enforceMs: boolean;
		archived: boolean;
		rules: string;
	}[];
	levels: Level[];
	moderators: {
		gameId: string;
		userId: string;
		level: ModeratorType;
	}[];
	platforms: Platform[];
	regions: [];
	runCounts: {
		gameId: string;
		categoryId: string;
		variableId: string;
		valueId: string;
		count: number;
	}[];
	theme: {
		id: string;
		url: string;
		primaryColor: string;
		panelColor: string;
		panelOpacity: number;
		// TODO enum
		navbarColor: number;
		backgroundColor: string;
		// TODO enum
		backgroundFit: number;
		// TODO enum
		backgroundPosition: number;
		// TODO enum
		backgroundRepeat: number;
		// TODO enum
		backgroundScrolling: number;
		// TODO enum
		foregroundFit: number;
		// TODO enum
		foregroundPosition: number;
		// TODO enum
		foregroundRepeat: number;
		// TODO enum? Or is it true false
		foregroundScrolling: number;
		touchDate: number;
		staticAssets: StaticAsset[];
	}[];
	users: User[];
	values: Value[];
	variables: Variable[];
}
