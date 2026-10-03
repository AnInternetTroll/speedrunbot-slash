export interface GetSearchParams {
	query: string;
	limit: number;
	includeGames?: boolean;
	includeNews?: boolean;
	includePages?: boolean;
	includeSeries?: boolean;
	includeUsers?: boolean;
}
