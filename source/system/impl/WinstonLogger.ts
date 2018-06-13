import { Logger } from '../Logger';
import { ConfigContract } from '../../app/config/ConfigContract';
import { autoInject } from '../../system/Injection';

import * as winston from 'winston';
import { NO_ERRORS_SCHEMA } from '@angular/core';

@autoInject
export class WinstonLogger extends Logger {

    private logger: winston.LoggerInstance;

    constructor(readonly config: ConfigContract) {
        super();
        const { 'log_level': level = 'info' } = config;

        const timestamp = () => { return new Date() };
        const formatter = (options) => {
            console.log(options.meta);
            const { func = 'default' } = this.trace().pop() || {};

            return `[${options.level.toUpperCase()}] ${options.message || ''} ${options.meta} ${options.timestamp()}`;
        }

        this.logger = new winston.Logger({
            level,
            transports: [
                new winston.transports.Console({ formatter, timestamp }),
            ]
        });
    }

    trace() {
        const stacks: string | undefined = (new Error).stack;
        if (!stacks) return [];

        return stacks.split('\n').map((stack) => {
            const [func, path] = stack.trim().split(' ').slice(1);
            return { func, path };
        }).slice(3, -1);
    }



    debug(message: any) {
        message = { ...message, ...this.trace()[0] }
        this.logger.debug(message);
    }

    info(message: any) {
        this.logger.info(message);
    }

    warn(message: any) {
        this.logger.warn(message);
    }

    error(message: any) {
        message = { ...message, ...this.trace()[0] }
        this.logger.error(message);
    }

}
