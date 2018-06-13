import { Command } from './Command';
import { BaseError } from "../system/BaseError";

import * as path from 'path';
import * as Validator from 'is-my-json-valid';

import { dereference } from 'json-schema-ref-parser';
import Callback = Command.Callback;

export abstract class CommandBus {

    protected schemaPath = '';

    protected readonly workers = new Map<any, Worker>();

    public setSchemaPath(schemaPath: string) {
        this.schemaPath = schemaPath;
    }

    async resolve() {
        for (const [type, worker] of this.workers) {
            if (!worker.validator) {
                const filePath = path.join(this.schemaPath, type.SCHEMA_FILE);
                const schema = await dereference(filePath);
                worker.validator = Validator(schema, { greedy: true });
            }
        }
    }

    abstract register<T>(type: any, handler: Command.Handler<T>);

    abstract execute(command: any, callback?: Callback): Promise<any>;

}


export interface Worker {
    readonly handler: Command.Handler<any>;
    type?: Command.Static<any>;
    id?: string;
    validator?: Validator.Func;
    callbacks?: any,
    anonymous?: boolean
}

export class CommandHandlerExisted extends BaseError {
}

export class CommandHandlerNotFound extends BaseError {
}

export class CloudCommandHandlerNotFound extends BaseError {
}

export class CommandValidatorNotFound extends BaseError {
}