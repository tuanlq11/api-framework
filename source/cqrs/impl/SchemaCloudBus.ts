import { QueueConfig, RabbitMQ } from '../../common/RabbitMQ';
import { randomBytes, createHash } from 'crypto';

import { AMQPClient, AMQPExchange, AMQPQueue, ConnectionOptions, ExchangeOptions, QueueOptions } from 'amqp';
import {
    CloudCommandHandlerNotFound,
    CommandBus,
    CommandHandlerExisted,
    CommandHandlerNotFound,
    Worker
} from "../CommandBus";

import { Command } from '../Command';
import { convert } from './SchemaUtil';

import { InvalidCommand } from '../InvalidCommand';
import * as uuid from 'uuid';

import Callback = Command.Callback;

export class SchemaCloudBus extends CommandBus {

    private __id: string;
    private __appName: string;
    private __uniqueName: string;
    private __zone: string;

    private __rabbitMQ: RabbitMQ;
    private __exchangeName: string;

    protected readonly cloud_workers = new Map<any, Worker>();

    constructor() {
        super();
    }

    /**
     * Get worker by name | type
     *
     * @param key
     * @param body
     * @returns {{worker: any, cloud_worker: any}}
     */
    private getWorker(key: any | Command.CloudStatic<any>, body?: any): { worker: Worker, cloud_worker: Worker } {

        let worker: any;
        let cloud_worker: any;

        try {
            if (typeof key === 'string') {
                cloud_worker = this.cloud_workers.get(key);
                if (!cloud_worker) throw new CloudCommandHandlerNotFound();

                worker = this.workers.get((cloud_worker as any).type);
            } else {
                worker = this.workers.get(key);
                if (!worker) throw new CommandHandlerNotFound();

                cloud_worker = this.cloud_workers.get((worker as any).id);
            }
        } catch (err) {

            // Anonymous worker
            if (err instanceof CommandHandlerNotFound && body.HANDLER_NAME && body.ROUTING_KEY) {
                cloud_worker = worker = {
                    handler:   () => {
                    },
                    id:        this.generateId(),
                    type:      { HANDLER_NAME: body.HANDLER_NAME, ROUTING_KEY: body.ROUTING_KEY },
                    callbacks: {},
                    anonymous: true
                };
            } else {
                throw err;
            }

        }

        return { worker, cloud_worker }
    }

    /**
     * Init configuration & connect to cloud
     *
     * @param config
     * @returns {Promise<void>}
     */
    async load(config: any) {

        this.__id = this.generateId();

        this.__zone = config.registry.configuration.label || 'global';

        this.__appName = SchemaCloudBus.formatAppName(config.name, this.__zone);

        this.__uniqueName = this.__appName.concat(':', this.__id).toLowerCase();

        this.__exchangeName = config.bus.exchange;

        const type = config.bus.type || 'direct';

        const host     = config.spring.rabbitmq.host;
        const port     = config.spring.rabbitmq.port;
        const login    = config.spring.rabbitmq.username;
        const password = config.spring.rabbitmq.password;

        await this.connectCloud(
            this.__appName, this.__exchangeName,
            { host, port, login, password },
            { durable: true, type },
            [
                { name: this.__appName, routingKey: this.__appName, options: { durable: true } },
                { name: this.__uniqueName, routingKey: this.__uniqueName, options: { durable: true } },
            ]
        );

    }

    /**
     * Connect to cloud bus server
     *
     * @param appName
     * @param exchangeName
     * @param connectionOptions
     * @param exchangeOptions
     * @param queueConfigs
     * @returns {Promise<void>}
     */
    async connectCloud(appName, exchangeName, connectionOptions: ConnectionOptions,
                       exchangeOptions: ExchangeOptions, queueConfigs: QueueConfig[]): Promise<void> {

        this.__rabbitMQ = new RabbitMQ(appName, exchangeName, connectionOptions, exchangeOptions, queueConfigs);
        await this.__rabbitMQ.connect(await this.onMessage.bind({ workers: this.cloud_workers, context: this }));

    }

    /**
     * Handler message receiver
     *
     * @param message
     * @param header
     * @param deliveryInfo
     * @param messageObject
     * @returns {Promise<void>}
     */
    private async onMessage(message, header, deliveryInfo, messageObject) {
        const payload: Payload = JSON.parse(message.data.toString('utf8'));
        const context          = (this as any).context;

        const worker = this.workers.get(payload.handler as any);

        // Define "me" object of this
        const me: Me                = {
            app:        context.__appName,
            uniqueName: this.__uniqueName,
            handler:    (worker || { handler: '' }).handler as string
        };
        const { sender, sessionId } = payload;

        try {

            // FALLBACK message
            if (payload.direction == DIRECTION_ENUM.FALLBACK as any) {

                if (worker && worker.callbacks[payload.sessionId]) {
                    worker.callbacks[payload.sessionId](true, payload.message);
                    delete worker.callbacks[payload.sessionId];
                }

                console.log(payload.message);
            }
            else {


                if (worker) {
                    const response = await worker.handler(payload.message);

                    // REQUEST message
                    if (payload.direction == DIRECTION_ENUM.REQUEST as any) {
                        context.publish(sender.uniqueName, sessionId, me, sender.handler, response, DIRECTION_ENUM.RESPONSE as any);
                    }

                    // RESPONSE message
                    if (payload.direction == DIRECTION_ENUM.RESPONSE as any && worker.callbacks[payload.sessionId]) {
                        worker.callbacks[payload.sessionId](false, payload.message);
                        delete worker.callbacks[payload.sessionId];
                    }

                } else {
                    context.publish(sender.uniqueName, sessionId, me, sender.handler, { message: 'Command not found' }, DIRECTION_ENUM.FALLBACK as any);
                }
            }
        } finally {
            if (worker && worker.anonymous) {
                context.cloud_workers.delete(worker.id);
            }
        }
    }

    /**
     * Push worker to queue
     *
     * @param type
     * @param handler
     */
    public register<T>(type: Command.CloudStatic<T>,
                       handler: Command.Handler<T>,) {

        if (this.workers.has(type)) throw new CommandHandlerExisted();

        const id     = this.generateWorkerName(type);
        const worker = { id, type, handler, callbacks: {} };

        // Register with command queue
        this.workers.set(type, worker);

        // Register with cloud queue
        this.cloud_workers.set(id, worker);
    }

    /**
     * Validate & execute worker
     *
     * @param command
     * @param timeout
     * @param callback
     */
    public execute(command: any, callback?: (err: boolean, msg: any) => void, timeout?: number) {
        const { cloud_worker } = this.validate(command);

        const type = cloud_worker.type as Command.CloudStatic<any>;
        if (!type.HANDLER_NAME) throw new CloudCommandHandlerNotFound();

        const sessionId = this.generateId();

        if (callback) {
            cloud_worker.callbacks[sessionId] = callback;

            if (cloud_worker.anonymous) {
                this.cloud_workers.set(cloud_worker.id, cloud_worker);
            }

            setTimeout((() => {
                if (cloud_worker.callbacks[sessionId]) {
                    cloud_worker.callbacks[sessionId](true, 'timeout');
                    delete cloud_worker.callbacks[sessionId];
                }

                // Remove anonymous-handler after it received response
                if (cloud_worker.anonymous) this.cloud_workers.delete(cloud_worker.id);
            }), timeout || 10000);

        }

        const me      = { app: this.__appName, uniqueName: this.__uniqueName, handler: cloud_worker.id as string };
        const handler = this.hash(type.HANDLER_NAME.toLowerCase());

        // Push to Cloud
        return this.publish(
            SchemaCloudBus.formatAppName(type.ROUTING_KEY, this.__zone),
            sessionId,
            me,
            handler,
            command, DIRECTION_ENUM.REQUEST as any
        );
    }

    /**
     * Check command input parameters
     *
     * @param command
     * @returns {Worker}
     */
    public validate(command: any): { worker: Worker, cloud_worker: Worker } {

        const { worker, cloud_worker } = this.getWorker(command.constructor, command);

        if (!worker) throw new CommandHandlerNotFound();

        if (worker.validator) {
            const valid = worker.validator(command);
            if (!valid) {
                const errors = convert(worker.validator.errors);
                throw new InvalidCommand(errors);
            }
        }

        return { worker, cloud_worker };
    }

    /**
     * Publish message to exchange
     *
     * @param routingKey
     * @param sessionId
     * @param sender
     * @param handler
     * @param message
     * @param direction
     * @returns {Promise<{err, msg }>}
     */
    public async publish(routingKey: string, sessionId: string, sender: Me, handler: string,
                         message: any, direction: Direction): Promise<{ err: any, msg: any }> {

        return await this.__rabbitMQ.publish(
            routingKey,
            JSON.stringify({ sessionId, sender, direction, handler, message }),
            { appId: this.__appName }
        );
    }

    /**
     * Generate instance unique key
     *
     * @param type
     * @returns {string}
     */
    private generateWorkerName(type: Command.CloudStatic<any>) {
        const handler = type.name;

        return this.hash(handler.concat('-', type.SCHEMA_FILE).toLowerCase());
    }

    private hash(data) {
        const hash = createHash('md5');

        return hash.update(data.toString()).digest('hex');
    }

    /**
     * Generate message id
     */
    private generateId() {
        return uuid.v4()
    }

    /**
     * Format appName pattern
     *
     * @param appName
     * @param zone
     * @returns {string}
     */
    public static formatAppName(appName: string, zone: string) {
        return appName.concat('-', zone);
    }

}

export interface Payload {
    sender: Me,
    direction: Direction,
    handler: string,
    sessionId: string,
    message: any
}

export interface Me {
    app: string,
    uniqueName: string,
    handler: string
}

export type Direction = 'request' | 'response' | 'fallback'

export enum DIRECTION_ENUM { REQUEST = 'request' as any, RESPONSE = 'response' as any, FALLBACK = 'fallback' as any}