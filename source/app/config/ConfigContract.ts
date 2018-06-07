export abstract class ConfigContract {

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

}