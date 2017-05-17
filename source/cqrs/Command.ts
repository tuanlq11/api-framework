export namespace Command {

	export interface Static<T> {
		new(...args): T;
		readonly SCHEMA_FILE: string;
	}

	export interface Handler<T> {
		(command: T): Promise<any>;
	}

}
