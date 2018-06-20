import { SchemaCommandBus } from './SchemaCommandBus';
import { Command } from '../Command';
import { autoInject } from '../../system/Injection';

import * as uuid from 'uuid';

import { ConfigContract } from '../../app/config/ConfigContract';
import { MessageBroker } from '../../lib/message/MessageBroker';
import { Logger } from '../../system/Logger'

@autoInject
export class SchemaBrokerBus extends SchemaCommandBus {

    private readonly id: string;
    private readonly queue: string;

    private readonly types: { name: string, type: Command.Static<any> };

    constructor(
        readonly logger: Logger,
        readonly config: ConfigContract,
        readonly messageBroker: MessageBroker
    ) {
        super();

        this.id = uuid.v4();
        const { name, env, registry: { configuration: { "label": project } } } = config;

        this.queue = `${project}.${env}.${name}.${this.id}`;

        this.subscribe();
    }

    /**
     * Initialize queue for subscribe
     */
    async subscribe() {
        const { "queue": name, messageBroker, logger } = this;


        await messageBroker.connect();
        await messageBroker.sub({ name, consume: () => this.consume });

        await this.routing();
    }

    /**
     * Routing message
     */
    async routing() {
        const { messageBroker, config, "queue": queueName } = this;
        const { name, env, registry: { configuration: { "label": project } } } = config;

        const queue = { name: queueName, type: 'queue' };

        const projectRouter = { name: `${project}.${env}`, type: 'mixed' };
        const serviceRouter = { name: `${project}.${env}.${name}`, type: 'exchange' };

        // Create router
        await messageBroker.router({ name: projectRouter.name, type: 'topic' });
        await messageBroker.router({ name: serviceRouter.name, type: 'direct' });

        await messageBroker.routing({ src: projectRouter, dest: serviceRouter, pattern: `${projectRouter}.#` })
        await messageBroker.routing({ src: serviceRouter, dest: queue, pattern: name });
    }

    /**
     * Message consumer
     * 
     * @param msg string
     */
    private async consume(msg: any) {

        const { "content": raw, fields, properties } = msg;
        const { "type": typeName, agruments } = JSON.parse(raw.toString('utf8'));

        const Type = this.types[typeName];
        const command = new Type(agruments);

        const result = await this.execute(command);

        return result;
    }

    /**
     * Push worker to queue
     *
     * @param type
     * @param handler
     */
    register<T>(type: Command.Static<T>, handler: Command.Handler<T>, ) {
        super.register(type, handler);

        if (type.name) this.types[type.name] = type;
    }

    /**
     * Note: Only support balancing with Direct Exchange
     * 
     * @param payload Payload
     */
    async publish(payload: Payload) {
        const { config } = this;
        const { env, registry: { configuration: { "label": project } } } = config;

        let address = `${project}.${env}`;
        if (payload.app) address = address.concat(`.${payload.app}.${payload.command}`);

        return this.messageBroker.pub(address, payload.content);
    }

}

export interface Payload {
    command: string,
    app?: string,
    content: Object
}
