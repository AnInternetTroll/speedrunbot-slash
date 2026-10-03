import type { Pagination } from "../types/pagination.ts";
import type { User } from "../types/user.ts";

export interface GetCommentListResponse {
	commentable: {
		itemType: number;
		itemId: string;
		properties: { disabled: boolean; locked: boolean };
		permissions: {
			canManage: boolean;
			canViewComments: boolean;
			canPostComments: boolean;
			canEditComments: boolean;
			canDeleteComments: boolean;
			cannotViewReasons: string[] | undefined;
			cannotPostReasons: string[] | undefined;
		};
	};
	commentList: ({
		id: string;
		itemType: number;
		itemId: string;
		date: number;
		userId: string;
		text: string;
		parentId: string;
		deleted: false;
	} | {
		date: number;
		deleted: true;
		deletedUserId: boolean;
		id: string;
		itemId: string;
		itemType: number;
		parentId: string;
		userId: string;
	})[] | undefined;
	likeList: [] | undefined;
	userList: User[] | undefined;
	pagination: Pagination;
}
