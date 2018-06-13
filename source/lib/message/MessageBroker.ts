import { ConfigContract } from '../../app/config/ConfigContract';

export abstract class MessageBroker {

    constructor(readonly config: ConfigContract) { };

    abstract connect(): Promise<boolean>;
    abstract disconnect(): Promise<boolean>;

    abstract pub(to, content): boolean;
    abstract sub(name: string, consume?: ConsumeCallback): Promise<MessageBroker>;

    /** Route feature only for RabbitMQ  */
    abstract router(name: string, type: string, options?: any): Promise<MessageBroker>;
    abstract routing(src: string, dest: DestRouter, pattern?: string, options?: Object): Promise<MessageBroker>;
}

export interface DestRouter {
    type: string;
    name: string;
}

export interface ConsumeCallback {
    (msg: any): void
}