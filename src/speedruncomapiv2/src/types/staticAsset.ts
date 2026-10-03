import { AssetType } from "./AssetType.ts";

export interface StaticAsset {
	assetType: AssetType;
	path: string;
}
