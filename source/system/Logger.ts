export abstract class Logger {
	abstract debug(message: any, ...meta: any[]): void;
	abstract info(message: any, ...meta: any[]): void;
	abstract warn(message: any, ...meta: any[]): void;
	abstract error(message: any, ...meta: any[]): void;
}
