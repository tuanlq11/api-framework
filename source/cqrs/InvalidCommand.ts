import { BaseError } from '../system/BaseError';


export namespace InvalidCommand {

	export interface ErrorDict {
		readonly [field: string]: string;
	}

}


export class InvalidCommand extends BaseError {

	constructor(
		public readonly errors: InvalidCommand.ErrorDict,
	) {
		super();
	}

}
