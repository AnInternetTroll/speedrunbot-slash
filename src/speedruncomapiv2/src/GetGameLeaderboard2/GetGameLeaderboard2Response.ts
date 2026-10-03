import { Player } from "../types/Player.ts";
import type { Pagination } from "../types/pagination.ts";

export interface GetGameLeaderboard2Response {
	pagination: Pagination;
	playerList: Player[] | undefined;
	runList: {
		id: string;
		gameId: string;
		categoryId: string;
		time: number;
		enforceMs: boolean;
		platformId: string;
		emulator: boolean;
		video: string;
		comment: string;
		submittedById: string;
		verified: number;
		verifiedById: string;
		date: number;
		dateSubmitted: number;
		dateVerified: number;
		hasSplits: boolean;
		obsolete: boolean;
		place: number;
		// TODO what is this?
		issues: unknown | null;
		playerIds: string[] | undefined;
		valueIds: string[] | undefined;
	}[];
}
