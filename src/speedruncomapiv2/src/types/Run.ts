export interface Run {
	id: string;
	gameId: string;
	levelId: string;
	categoryId: string;
	// "x.xxxs"
	time?: string;
	timeWithLoads?: string;
	enforceMs?: boolean;
	platformId: string;
	emulator: boolean;
	regionId: string;
	video: string;
	comment?: string;
	submittedById: string;
	verified: number;
	verifiedById?: string;
	reason?: string;
	submittedAt: string;
	performedAt: string;
	verifiedAt: string;
	hasSplits: boolean;
	obsolete: boolean;
	place: string;
	issues: null;
	playerIds: string[] | undefined;
	valueIds: string[] | undefined;
}
