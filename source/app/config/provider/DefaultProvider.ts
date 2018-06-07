'use strict';

import { ConfigProviderContract } from "../ConfigProviderContract";

const _ = require('underscore-x');

export class DefaultProvider implements ConfigProviderContract {

    private content: any;

    load() {
        this.content = {
            registry: {
                eureka: {
                    server:   {
                        proto: 'http'
                    },
                    instance: {
                        renewalIntervalInSecs: 30,
                        durationInSecs:        90,
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

    getContent(): any {
        return this.content;
    }

    setSource(config: any): ConfigProviderContract {
        return this;
    }
}