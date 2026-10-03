import { Challenge } from "../types/Challenge.ts";
import { Platform } from "../types/Platform.ts";
import { Player } from "../types/Player.ts";
import { Region } from "../types/Region.ts";
import { Run } from "../types/Run.ts";
import { UserProfile } from "../types/UserProfile.ts";
import { Value } from "../types/Value.ts";
import { Variable } from "../types/Variable.ts";
import { Game } from "../types/game.ts";
import { User } from "../types/user.ts";

export interface GetUserLeaderboardResponse {
	games: Game[] | undefined;
	user: User;
	users: [] | undefined;
	runs: Run[] | undefined;
	players: Player[] | undefined;
	platforms: Platform[] | undefined;
	regions: Region[] | undefined;
	userProfile: UserProfile | undefined;
	values: Value[] | undefined;
	variables: Variable[] | undefined;
	followedGamesIds: null;
	challengeList: Challenge[] | undefined;
	challengeRunList: Run[] | undefined;
}
