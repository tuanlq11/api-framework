'use strict';

import { ConfigProviderContract } from "../ConfigProviderContract";

export class DefaultProvider extends ConfigProviderContract {

    load() {
        this.content = {
            name: 'microservice',
            listen: {
                addr: '127.0.0.1',
                port: 3020
            },
            registry: {
                configuration: {
                    proto: 'http',
                    prefix: 'config'
                },
                eureka: {
                    enabled: true,
                    server: {
                        proto: 'http'
                    },
                    instance: {
                        renewalIntervalInSecs: 30,
                        durationInSecs: 90,
                        registryFetchInterval: 30000
                    }
                }
            }
        };
    }

    exists(key: string): boolean {
        return !!this.content[key];
    }

    getPath(): string | any {
        return null;
    }
}