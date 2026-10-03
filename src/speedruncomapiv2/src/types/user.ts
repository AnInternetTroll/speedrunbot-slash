import type { StaticAsset } from "./staticAsset.ts";

export interface User {
	id: string;
	name: string;
	url: string;
	powerLevel: number;
	pronouns: string[] | undefined;
	areaId: string;
	color1Id: string;
	color2Id?: string;
	colorAnimate?: number;
	isSupporter?: boolean;
	iconType: number;
	supporterIconType?: number;
	supporterIconPosition?: number;
	onlineDate: number;
	signupDate: number;
	touchDate: number;
	staticAssets: StaticAsset[] | undefined;
}
