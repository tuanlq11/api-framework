export namespace Command {

    export interface Static<T> {
        new(...args): T;
        readonly SCHEMA_FILE: string;
    }

    export interface Handler<T> {
        (command: T): Promise<any>;
    }

    export interface CloudStatic<T> extends Static<T> {
        readonly ROUTING_KEY: string;
        readonly HANDLER_NAME?: string;
    }

    export interface Callback {
        (error: boolean, msg: string): void
    }

}
