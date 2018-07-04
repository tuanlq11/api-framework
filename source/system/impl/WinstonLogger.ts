import { Logger } from '../Logger';
import { ConfigContract as Config } from '../../config/ConfigContract';
import { autoInject } from '../../system/Injection';

import * as winston from 'winston';
import * as path from 'path';

import 'winston-logrotate';

@autoInject
export class WinstonLogger extends Logger {

    private logger: winston.LoggerInstance;

    public filename: string;

    constructor(readonly config: Config) {
        super();
        const { log: { level } } = config;

        this.filename = path.join(this.config.data.dir, 'logs', 'application.log');

        this.logger = new winston.Logger({
            level,
            transports: this.transports()
        });
    }

    transports() {

        const timestamp = () => { return new Date().toUTCString() };
        const formatter = (options) => {
            return `[${options.level.toUpperCase()}] ${options.message} ${(options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '')} ${options.timestamp()}`;
        }

        return [
            new winston.transports.Console({ timestamp, formatter }),
            new (winston.transports as any).Rotate({
                colorize: false,
                json: false,
                file: this.filename,
                size: '10m',
                keep: 10, 
                compress: true
            })
        ]
    }

    debug(message: any, ...meta: any[]) {
        this.logger.debug(message, ...meta);
    }

    info(message: any, ...meta: any[]) {
        this.logger.info(message, ...meta);
    }

    warn(message: any, ...meta: any[]) {
        this.logger.warn(message, ...meta);
    }

    error(message: any, ...meta: any[]) {
        this.logger.error(message, ...meta);
    }

    async query(options: any) {
        return new Promise((resolve, reject) => {
            this.logger.query(options, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}
