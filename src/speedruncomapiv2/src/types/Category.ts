export interface Category {
	id: string;
	name: string;
	url: string;
	pos: number;
	gameId: string;
	isMisc: boolean;
	isPerLevel: boolean;
	numPlayers: number;
	exactPlayers: boolean;
	playerMatchMode: number;
	timeDirection: number;
	enforceMs: boolean;
	archived: boolean;
	rules: string;
}
