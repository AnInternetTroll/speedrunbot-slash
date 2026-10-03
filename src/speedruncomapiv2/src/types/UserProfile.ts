import { GameOrdering } from "./GameOrdering.ts";

export interface UserProfile {
	userId: string;
	signupDate: number;
	defaultView: number;
	showMiscByDefault: boolean;
	gameOrdering: GameOrdering;
	featuredFullRunId?: string;
	featuredLevelRunId?: string;
}
