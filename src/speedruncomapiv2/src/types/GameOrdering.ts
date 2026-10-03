import { GameOrderGroup } from "./GameOrderGroup.ts";

export interface GameOrdering {
	defaultGroups: GameOrderGroup[] | undefined;
	supporterGroups: GameOrderGroup[] | undefined;
}
