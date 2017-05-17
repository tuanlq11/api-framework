/// <reference path="../../typings/is-my-json-valid.d.ts" />
/// <reference path="../../typings/json-schema-ref-parser.d.ts" />

import * as path from 'path';
import * as Validator from 'is-my-json-valid';

import { dereference } from 'json-schema-ref-parser';
import { BaseError } from '../../system/BaseError';

import { Command } from '../Command';
import { CommandBus } from '../CommandBus';
import { InvalidCommand } from '../InvalidCommand';

import { convert } from './SchemaUtil';


interface Worker {
	readonly handler: Command.Handler<any>;
	validator?: Validator.Func;
}


class CommandHandlerExisted extends BaseError {}

class CommandHandlerNotFound extends BaseError {}

class CommandValidatorNotFound extends BaseError {}


export class SchemaCommandBus extends CommandBus {

	private schemaPath = '';

	private readonly workers = new Map<Command.Static<any>, Worker>();


	setSchemaPath(schemaPath: string) {
		this.schemaPath = schemaPath;
	}


	register<T>(
		type: Command.Static<T>,
		handler: Command.Handler<T>,
	) {
		if (this.workers.has(type)) throw new CommandHandlerExisted();
		this.workers.set(type, { handler });
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


	execute(command: Object) {

		const worker = this.workers.get(command.constructor as any);
		if (!worker) throw new CommandHandlerNotFound();
		if (!worker.validator) throw new CommandValidatorNotFound();

		const valid = worker.validator(command);
		if (!valid) {
			const errors = convert(worker.validator.errors);
			throw new InvalidCommand(errors);
		}

		return worker.handler(command);

	}

}
