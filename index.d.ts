declare namespace framework {

    abstract class ConfigContract {
        source: {
            path: string;
        };

        name: string;

        listen: {
            host: string;
            addr: string;
            port: number;
        };

        registry: {
            eureka: {
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

}

export = framework