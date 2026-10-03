/**
 * At least one of gameId or gameUrl must be present
 *
 * gameId takes priority
 */
export interface GetGameDataBody {
	gameId?: string;
	gameUrl?: string;
}
