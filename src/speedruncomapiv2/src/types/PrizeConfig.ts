import { Prize } from "./Prize.ts";

export interface PrizeConfig {
	prizePool: number;
	currency: number;
	prizes: Prize[] | undefined;
}
