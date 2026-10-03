import type { User } from "../types/user.ts";

export interface GetThreadListResponse {
	threadList: {
		id: string;
		name: string;
		gameId: string;
		forumId: string;
		userId: string;
		replies: number;
		created: number;
		lastCommentId: string;
		lastCommentUserId: string;
		lastCommentDate: number;
		sticky: boolean;
		locked: boolean;
	}[] | undefined;
	users: User[] | undefined;
	pagination: { count: number; page: number; pages: number; per: number };
}
