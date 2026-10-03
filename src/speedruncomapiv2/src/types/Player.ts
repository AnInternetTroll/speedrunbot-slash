import { ModeratorType } from "./ModeratorType.ts";

export interface Player {
	id: string;
	name: string;
	url: string;
	powerLevel: ModeratorType;
	color1Id: string;
	color2Id: string;
	// TODO enum?
	colorAnimate: number;
	areaId: string;
}
