import { connect, Connection, Options, Channel, Replies } from 'amqplib';
import { MessageBroker, DestRouter, ConsumeCallback } from '../MessageBroker';
import { ConfigContract } from '../../../app/config/ConfigContract';
import { Logger } from '../../../system/Logger';
import { autoInject } from '../../../system/Injection';

@autoInject
export class RabbitMQ extends MessageBroker {

    protected client: Connection;

    private channel: Channel;
    private exchanges = new Map<String, Replies.AssertExchange>();
    private queues = new Map<String, Replies.AssertQueue>();

    private options;

    constructor(readonly config: ConfigContract,
        readonly logger: Logger
    ) {
        super(config);
        const { config: { registry: { broker: { options } } } } = this;

        if (!options) {
            throw new Error('RabbitMQ Options not found!');
        }

        this.options = options;
    }

    async connect() {
        const { options: { username, hostname, port, password, exchange, type } } = this;

        if (!this.client) {
            const params: Options.Connect = { username, password, hostname, port };

            this.client = await connect(params)
            this.channel = await this.client.createChannel();
        }

        return true;
    }

    async disconnect() {
        if (!this.client) return false;

        await this.client.close();

        return true;
    }

    async router(name: string, type: string, options?: Options.AssertExchange) {

        if (!this.exchanges.has(name)) {
            options = { ...options, ...{ durable: false, autoDelete: true } };
            this.exchanges.set(name, await this.channel.assertExchange(name, type, options));
        }

        return this;
    }

    async routing(src: string, dest: DestRouter, pattern?: string, options?: Object) {
        const { channel } = this;
        const { type, name } = dest;

        if (type === 'queue') await channel.bindQueue(name, src, pattern || name, options);
        if (type === 'exchange' && pattern) await channel.bindExchange(name, src, pattern);

        return this;
    }

    async sub(name: string, consume?: ConsumeCallback) {

        const { channel, queues } = this;
        if (queues.has(name)) return this;

        const queueOptions = { autoDelete: true, durable: false };
        queues.set(name, await channel.assertQueue(name, queueOptions));

        if (consume) channel.consume(name, consume);

        return this;
    }

    pub(to, content) {
        const { options: { exchange }, channel } = this;

        return channel.publish(exchange, to, Buffer.from(content))
    }

}

