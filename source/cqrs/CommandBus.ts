import { Command } from './Command';


export abstract class CommandBus {

	abstract register<T>(
		type: Command.Static<T>,
		handler: Command.Handler<T>,
	): void;

	abstract execute(command: any): Promise<any>;

}
