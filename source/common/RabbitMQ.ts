const amqp = require('amqp');

import {
    AMQPClient, AMQPExchange, AMQPQueue, ConnectionOptions, ExchangeOptions, ExchangePublishOptions,
    QueueOptions
} from 'amqp';

export type ConnectResult = { exchange: AMQPExchange, queues: AMQPQueue[], client: AMQPClient };

export class RabbitMQ {

    private __appName: string;

    private __exchangeName: string;

    private __exchangeOptions: ExchangeOptions;
    private __connectionOptions: ConnectionOptions;

    private __client: AMQPClient;

    private __exchange: AMQPExchange;
    private __queues: AMQPQueue[];

    private readonly __queueConfigs: QueueConfig[];

    constructor(readonly appName: string,
                readonly exchangeName: string,
                readonly connectionOptions: ConnectionOptions,
                readonly exchangeOptions: ExchangeOptions,
                readonly queueConfigs: QueueConfig[]) {

        this.__appName = appName;

        this.__exchangeOptions = exchangeOptions;
        this.__exchangeName    = exchangeName || 'CloudBus';

        this.__queueConfigs = queueConfigs;

        this.__connectionOptions = connectionOptions;

    }


    public async connect(onSubscribe: Function): Promise<void> {

        await (new Promise((resolve, reject) => {

            const client = amqp.createConnection(this.__connectionOptions);

            client.on('ready', () => {

                // Declare exchange
                client.exchange(this.__exchangeName, this.__exchangeOptions, (exchange: AMQPClient | any) => {

                    const queues: AMQPQueue[] = [];

                    for (const queueConfig of this.__queueConfigs) {

                        // Declare queue
                        client.queue(queueConfig.name, queueConfig.options, (queue: AMQPQueue | any) => {
                            queue.bind(exchange.name, queueConfig.routingKey);

                            queue.subscribe(onSubscribe);

                            queues.push(queue);

                            if (queues.length == this.__queueConfigs.length) {
                                resolve({ exchange, queues, client });
                            }
                        })
                    }


                });
            })

        })).then((res: ConnectResult) => {
            this.__exchange = res.exchange;
            this.__queues   = res.queues;
            this.__client   = res.client;
        });

    }

    public async publish(routingKey: string, message: any, options: ExchangePublishOptions) {

        let result: any = null;

        await (new Promise((resolve, reject) => {

            this.__exchange.publish(routingKey, message, options, (err: boolean, msg: string) => {
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

export interface QueueConfig {
    name: string,
    routingKey: string,
    options: QueueOptions
}
