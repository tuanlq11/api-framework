export abstract class Logger {

	public filename: string;

	abstract debug(message: any, ...meta: any[]): void;
	abstract info(message: any, ...meta: any[]): void;
	abstract warn(message: any, ...meta: any[]): void;
	abstract error(message: any, ...meta: any[]): void;

	async query(options?: any): Promise<any> {
		return null;
	}
}
