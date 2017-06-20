import { CommandBus, CommandHandlerExisted, CommandHandlerNotFound, CommandValidatorNotFound } from '../CommandBus';
import { InvalidCommand } from '../InvalidCommand';

import { convert } from './SchemaUtil';
import { Command } from "../Command";


export class SchemaCommandBus extends CommandBus {

    public register<T>(type: Command.Static<T>,
                       handler: Command.Handler<T>,) {
        if (this.workers.has(type)) throw new CommandHandlerExisted();
        this.workers.set(type, { handler });
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
