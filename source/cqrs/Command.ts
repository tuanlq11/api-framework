export namespace Command {

    export interface Static<T> {
        new(...args): T;
        readonly name?: string;
        readonly SCHEMA_FILE: string;
    }

    export interface Handler<T> {
        (command: T): Promise<any>;
    }

    export interface Callback {
        (error: boolean, msg: string): void
    }

}
