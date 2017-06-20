const amqp = require('amqp');

import { AMQPClient, AMQPExchange, AMQPQueue, ConnectionOptions, ExchangeOptions, QueueOptions } from 'amqp';

export type ConnectResult = { exchange: AMQPExchange, queue: AMQPQueue, client: AMQPClient };

export class RabbitMQ {

    private __appName: string;

    private readonly __queueOptions: QueueOptions;

    private __exchangeName: string;
    private __exchangeOptions: ExchangeOptions;

    private __connectionOptions: ConnectionOptions;

    private __client: AMQPClient;
    private __exchange: AMQPExchange;
    private __queue: AMQPQueue;

    constructor(readonly appName: string,
                readonly exchangeName: string,
                readonly connectionOptions: ConnectionOptions,
                readonly exchangeOptions: ExchangeOptions,
                readonly queueOptions?: any) {

        this.__appName = appName;

        this.__exchangeOptions = exchangeOptions;
        this.__exchangeName    = exchangeName || 'CloudBus';

        this.__queueOptions = queueOptions;

        this.__connectionOptions = connectionOptions;

    }


    public async connect(onSubscribe: Function): Promise<void> {

        await (new Promise((resolve, reject) => {

            const client = amqp.createConnection(this.__connectionOptions);

            client.on('ready', () => {

                // Declare exchange
                client.exchange(this.__exchangeName, this.__exchangeOptions, (exchange: AMQPClient | any) => {

                    // Declare queue
                    client.queue(this.__appName, this.__queueOptions, (queue: AMQPQueue | any) => {
                        queue.bind(exchange.name, this.__appName);

                        queue.subscribe(onSubscribe);

                        resolve({ exchange, queue, client });
                    })
                });
            })

        })).then((res: ConnectResult) => {
            this.__exchange = res.exchange;
            this.__queue    = res.queue;
            this.__client   = res.client;
        });

    }

    public async publish(routingKey: string, message: any) {

        let result: any = null;

        await (new Promise((resolve, reject) => {

            this.__exchange.publish(routingKey, message, {}, (err: boolean, msg: string) => {
                if (err)
                    reject({ err, msg });
                else
                    resolve({ err, msg });
            })

        })).then((res) => {
            result = res;
        }).catch((res) => {
            result = res;
        });

        return result;
    }

}
