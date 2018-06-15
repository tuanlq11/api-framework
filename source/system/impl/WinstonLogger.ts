import { Logger } from '../Logger';
import { ConfigContract as Config } from '../../app/config/ConfigContract';
import { autoInject } from '../../system/Injection';

import * as winston from 'winston';

@autoInject
export class WinstonLogger extends Logger {

    private logger: winston.LoggerInstance;

    constructor(readonly config: Config) {
        super();
        const { 'log_level': level = 'info' } = config;

        const timestamp = () => { return new Date().toUTCString() };
        const formatter = (options) => {
            return `[${options.level.toUpperCase()}] ${options.message} ${(options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '')} ${options.timestamp()}`;
        }

        this.logger = new winston.Logger({
            level,
            transports: [
                new winston.transports.Console({ timestamp, formatter }),
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

    debug(message: any, ...meta: any[]) {
        this.logger.debug(message, ...meta, this.trace()[0]);
    }

    info(message: any, ...meta: any[]) {
        this.logger.info(message, ...meta);
    }

    warn(message: any, ...meta: any[]) {
        this.logger.warn(message, ...meta);
    }

    error(message: any, ...meta: any[]) {
        this.logger.error(message, ...meta, this.trace()[0]);
    }

}
