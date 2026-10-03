export class SpeedruncomError<T> {
	status: number;
	message: string;
	body?: T;

	constructor(status: number, message: string) {
		this.status = status;
		this.message = message;
		try {
			this.body = JSON.parse(message) as T;
		} catch {
			// Body is really messed up :/
		}
	}
}
