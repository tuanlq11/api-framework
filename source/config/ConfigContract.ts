export abstract class ConfigContract {

    source: {
        path: string;
    };

    name: string;

    env: Environment;

    log: {
        level?: LogLevel;
    }

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

export enum Environment {
    PROD = 'prod',
    DEV = 'dev',
    LOCAL = 'local',
    STAGING = 'staging',
    TEST = 'test',
    DEBUG = 'debug'
}

export enum LogLevel {
    INFO = 'info',
    ERROR = 'error',
    DEBUG = 'debug',
    WARN = 'warn',
    VERBOSE = 'verbose'
}