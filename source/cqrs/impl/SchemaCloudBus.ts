import { RabbitMQ } from "../../common/RabbitMQ";

import { AMQPClient, AMQPExchange, AMQPQueue, ConnectionOptions, ExchangeOptions, QueueOptions } from 'amqp';
import { CommandBus, CommandHandlerExisted, CommandHandlerNotFound, CommandValidatorNotFound } from "../CommandBus";
import { randomBytes, createHash } from 'crypto';

import { Command } from "../Command";
import { convert } from './SchemaUtil';
import { InvalidCommand } from "../InvalidCommand";

export class SchemaCloudBus extends CommandBus {

    private __rabbitMQ: RabbitMQ;

    private __appName: string;
    private __exchangeName: string;

    protected readonly cloud_workers = new Map<any, Worker>();

    async load(config: any) {

        this.__appName      = config.registry.instance.app || 'Eureka-'.concat(await randomBytes(16).toString('hex'));
        this.__exchangeName = config.get('bus.exchange');

        const type = config.get('bus.type') || 'direct';

        const host     = config.get('spring.rabbitmq.host');
        const port     = config.get('spring.rabbitmq.port');
        const login    = config.get('spring.rabbitmq.username');
        const passowrd = config.get('spring.rabbitmq.password');

        await this.connectCloud(
            this.__appName, this.__exchangeName,
            { host, port, login, passowrd },
            { durable: true, type }, { durable: true }
        );

    }

    async connectCloud(appName, exchangeName, connectionOptions: ConnectionOptions,
                       exchangeOptions: ExchangeOptions, queueOptions: QueueOptions): Promise<void> {
        this.__rabbitMQ = new RabbitMQ(appName, exchangeName, connectionOptions, exchangeOptions, queueOptions);
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
    private async  onMessage(message, header, deliveryInfo, messageObject) {
        const payload: Payload = JSON.parse(message.data.toString('utf8'));
        const context          = (this as any).context;

        if (payload.direction == DIRECTION_ENUM.FALLBACK as any) {
            console.log(payload.message);
        }
        else {
            const worker = this.workers.get(payload.handler as any);

            if (worker) {
                const response = await worker.handler(payload.message);

                if (payload.direction == DIRECTION_ENUM.REQUEST as any) {
                    context.publish(deliveryInfo.routingKey, worker.id, payload.sender, response, DIRECTION_ENUM.RESPONSE as any);
                }

            } else {
                context.publish(deliveryInfo.routingKey, payload.handler,
                    { message: 'Command not found' },
                    DIRECTION_ENUM.FALLBACK as any
                );
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

        const id = this.generateWorkerName(type);

        // Register with command queue
        this.workers.set(type, { handler, id });

        // Register with cloud queue
        this.cloud_workers.set(id, { handler, id } as any);
    }

    /**
     * Validate & execute worker
     *
     * @param command
     * @returns {Promise<{err: any, msg: any}>}
     */
    public execute(command: any): Promise<any> {
        const worker = this.validate(command);

        // Push to Cloud
        const type = worker.type as Command.CloudStatic<any>;

        return this.publish(
            type.ROUTING_KEY,
            worker.id as string,
            this.hash(type.HANDLER_NAME.toLowerCase()),
            command,
            DIRECTION_ENUM.REQUEST as any
        );
    }

    /**
     * Check command input parameters
     *
     * @param command
     * @returns {Worker}
     */
    public validate(command: any) {
        const worker = this.workers.get(command.constructor as any);
        if (!worker) throw new CommandHandlerNotFound();
        if (!worker.validator) throw new CommandValidatorNotFound();

        const valid = worker.validator(command);
        if (!valid) {
            const errors = convert(worker.validator.errors);
            throw new InvalidCommand(errors);
        }

        return worker;
    }

    /**
     * Publish message to exchange
     *
     * @param routingKey
     * @param sender
     * @param handler
     * @param message
     * @param direction
     * @returns {Promise<any>}
     */
    public async publish(routingKey: string, sender: string, handler: string, message: any, direction: Direction): Promise<{ err: any, msg: any }> {
        return await this.__rabbitMQ.publish(
            routingKey,
            JSON.stringify({
                    sender,
                    direction: direction || DIRECTION_ENUM.REQUEST,
                    handler,
                    message
                }
            )
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

}

export interface Payload {
    sender: string,
    direction: Direction,
    handler: string,
    message: any
}

export type Direction = 'request' | 'response' | 'fallback'
export enum DIRECTION_ENUM { REQUEST = 'request' as any, RESPONSE = 'response' as any, FALLBACK = 'fallback' as any}