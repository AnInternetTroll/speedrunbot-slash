import type { Pagination } from "../types/pagination.ts";
import type { User } from "../types/user.ts";

export interface GetThreadResponse {
	pagination: Pagination;
	users: User[] | undefined;
	thread: {
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
	};
	commentList: {
		id: string;
		itemType: number;
		itemId: string;
		date: number;
		userId: string;
		text: string;
		parentId: string;
		deleted: boolean;
	}[];
	likeList: {
		itemType: number;
		itemId: string;
		userId: string;
		date: number;
	}[];
}
