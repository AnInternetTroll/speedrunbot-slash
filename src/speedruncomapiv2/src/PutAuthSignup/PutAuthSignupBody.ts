export interface PutAuthSignupBody {
	name: string;
	password: string;
	email: string;
	areaId?: string;
	/**
	 * Not required, and not providing it will send an email
	 * to the "email" address with a token
	 */
	token?: string;
}
