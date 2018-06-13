declare namespace framework {

    enum Environment {
        PROD = 'prod',
        DEV = 'dev',
        LOCAL = 'local',
        STAGING = 'staging',
        TEST = 'test',
        DEBUG = 'debug'
    }

    enum LogLevel {
        INFO = 'info',
        ERROR = 'error',
        DEBUG = 'debug',
        WARN = 'warn',
        VERBOSE = 'verbose'
    }

    abstract class MessageBroker {

        abstract connect(): Promise<boolean>;
        abstract disconnect(): Promise<boolean>;

        abstract pub(to, content): boolean;
        abstract sub(name: string, consume?: ConsumeCallback): Promise<MessageBroker>;

        /** Route feature only for RabbitMQ  */
        abstract router(name: string, type: string, options?: any): Promise<MessageBroker>;
        abstract routing(src: string, dest: DestRouter, pattern?: string, options?: Object): Promise<MessageBroker>;
    }

    interface DestRouter {
        type: string;
        name: string;
    }

    interface ConsumeCallback {
        (msg: any): void
    }

    abstract class ConfigFactory {
        static build(path?: string);
    }

    abstract class ConfigContract {

        source: {
            path: string;
        };

        name: string;

        env: Environment;

        log_level?: string;

        listen: {
            host: string;
            addr: string;
            port: number;
        };

        registry: {
            broker: {
                dialect: 'rabbitmq' | 'kafka',
                enabled: boolean,
                options?: {
                    username: string,
                    password: string,
                    hostname: string,
                    port: number,
                    exchange: string,
                    type: string,
                }
            },
            eureka: {
                enabled: boolean,
                server: {
                    host: string;
                    port: number;
                    proto: string;
                },
                instance: {
                    host?: string;
                    addr?: string;
                    port?: number;
                    renewalIntervalInSecs?: number;
                    durationInSecs?: number;
                    registryFetchInterval?: number;
                }
            },
            configuration: {
                host: string;
                port: number;
                label: string;
                profiles: string[];
            }
        };

        sequelize: {
            database: string;
            username: string;
            password: string;
            options: any;
        };

        database: {
            host: string;
            port: number;
            name: string;
            username: string;
            password: string;
            options?: any;
        }

    }

    interface JsonLogger {
        debug(message: any);
        info(message: any);
        warn(message: any);
        error(message: any);
    }

    class EurekaClient {
        init(config: ConfigContract);
        getInstance(): Eureka;
        start();
        stop();
    }

    interface Eureka {
        constructor(config: any)
        start(): void;
        stop(): void;
        getInstancesByAppId(appId: string): string[];
        getInstancesByVipAddress(vidAddress: string): string[];
    }

    function bootstrap(target: any, providers: any[]);

    function autoInject(target);

    interface Context {

        req: object;
        res: object;
        respond: boolean;

        request: Request;
        response: Response;

        cookies: object;
        state: any;

        throw(status: number): never;

        header: any;

        hostname: string;

        method: string;
        path: string;
        query: any;

        get(field: string): string;
        is(...types: string[]): string | false;

        body: any;
        status: number;
        type: string;

        set(field: string, value: string): void;

    }

    interface Next {
        (): Promise<void>;
    }

    interface Middleware {
        (context: Context, next: Next): Promise<void>;
    }

    class RabbitMQ {
        connect();
        disconnect();
        sub(queue, pattern);
        pub(to, message);
    }

    abstract class Logger {
        abstract debug(message: any): void;
        abstract info(message: any): void;
        abstract warn(message: any): void;
        abstract error(message: any): void;
    }

    abstract class JsonLogger implements Logger { }
    abstract class WinstonLogger extends Logger { }
    abstract class TextLogger extends Logger { }

    abstract class Storage {
        readonly namespace: any;

        abstract get(key: string | symbol);
        abstract set(key: string | symbol, value: any);
        abstract run(fn: () => Promise<void>);
    }

    function component(metadata: any);

    class Koa {
        use(middleware: any);
        listen(port?: number);
    }

    abstract class Router {
        middleware();
    }

    namespace Command {

        interface Static<T> {
            new(...args): T;
            readonly name?: string;
            readonly SCHEMA_FILE: string;
        }

        interface Handler<T> {
            (command: T): Promise<any>;
        }

        interface Callback {
            (error: boolean, msg: string): void
        }

    }

    abstract class CommandBus {

        protected schemaPath: string;

        protected readonly workers: Map<any, Worker>;

        abstract setSchemaPath(schemaPath: string);

        abstract resolve(): Promise<void>

        abstract register<T>(type: any, handler: Command.Handler<T>);

        abstract execute(command: any, callback?: Command.Callback): Promise<any>;
    }

    abstract class SchemaCommandBus extends CommandBus{

    }

    abstract class SchemaBrokerBus extends CommandBus{

    }
    
}

export = framework