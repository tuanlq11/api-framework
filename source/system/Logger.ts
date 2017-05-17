export abstract class Logger {
	abstract debug(message: any): void;
	abstract info (message: any): void;
	abstract warn (message: any): void;
	abstract error(message: any): void;
}
