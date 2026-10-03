export interface GetGameLeaderboard2Params {
	params: {
		categoryId: string;
		// TODO enum?
		emulator: number;
		gameId: string;
		// TODO enum?
		obsolete: number;
		platformIds: [] | undefined;
		regionIds: [] | undefined;
		// TODO enum?
		timer: number;
		// TODO enum?
		verified: number;
		values: {
			variableId: string;
			valueIds: string[] | undefined;
		}[];
		// TODO enum?
		video: number;
	};
	page: string;
}
