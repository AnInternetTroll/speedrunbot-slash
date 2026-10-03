import { PrizeConfig } from "./PrizeConfig.ts";

export interface Challenge {
	id: string;
	name: string;
	url: string;
	gameId: string;
	createDate: number;
	updateDate: number;
	startDate: number;
	endDate: number;
	// TODO enum
	state: number;
	description: string;
	rules: string;
	numPlayers: number;
	exactPlayers: number;
	// TODO enum
	playerMatchMode: number;
	timeDirections: number;
	enforceMs: boolean;
	coverImagePath: string;
	contest: boolean;
	contestRules: string;
	// TODO enum
	runCommentsMode: number;
	prizeConfig: PrizeConfig;
	runsCommentsMode: number;
}
