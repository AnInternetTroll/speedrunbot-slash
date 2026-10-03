export interface Variable {
	id: string;
	name: string;
	url: string;
	pos: number;
	gameId: string;
	// TODO enum
	categoryScope: number;
	// TODO enum
	levelScope: number;
	levleId: string;
	isMandatory: boolean;
	isSubcategory: boolean;
	isUserDefined: boolean;
	isObsoleting: boolean;
	defaultValue: string;
	archived: boolean;
	// TODO enum
	displayMode: number;
}
