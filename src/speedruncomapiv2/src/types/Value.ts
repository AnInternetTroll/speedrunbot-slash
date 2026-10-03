export interface Value {
	id: string;
	name: string;
	url: string;
	pos: number;
	variableId: string;
	isMisc: boolean;
	rules?: string;
	archived: boolean;
}
