import { Command } from './Command';
import { BaseError } from "../system/BaseError";

import * as path from 'path';
import * as Validator from 'is-my-json-valid';

import { dereference } from 'json-schema-ref-parser';

export abstract class CommandBus {

    protected schemaPath = '';

    protected readonly workers = new Map<any, Worker>();

    public setSchemaPath(schemaPath: string) {
        this.schemaPath = schemaPath;
    }

    async resolve() {
        for (const [type, worker] of this.workers) {
            if (!worker.validator) {
                const filePath   = path.join(this.schemaPath, type.SCHEMA_FILE);
                const schema     = await dereference(filePath);
                worker.validator = Validator(schema, { greedy: true });
                worker.type      = type;
            }
        }
    }

    abstract register<T>(type: Command.Static<T>,
                         handler: Command.Handler<T>);

    abstract execute(command: any): Promise<any>;

}


interface Worker {
    readonly handler: Command.Handler<any>;
    type?: Command.Static<any>;
    id?: string;
    validator?: Validator.Func;
}

export class CommandHandlerExisted extends BaseError {
}

export class CommandHandlerNotFound extends BaseError {
}

export class CommandValidatorNotFound extends BaseError {
}