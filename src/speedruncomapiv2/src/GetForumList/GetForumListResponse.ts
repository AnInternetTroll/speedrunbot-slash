import { Game } from "../types/game.ts";
import type { User } from "../types/user.ts";

export interface GetForumListResponse {
	forumList: {
		id: string;
		name: string;
		description: string;
		type: number; // Enum here?
		threadCount: number;
		postCound: number;
		lastPostId: string;
		lastPostDate: number;
		lastPostUserId: string;
		touchDate: number;
	}[] | undefined;
	gameList: Game[] | undefined;
	userList: User[] | undefined;
}
