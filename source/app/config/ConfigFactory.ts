'use strict';

import { StaticProvider } from "./provider/StaticProvider";
import { CloudProvider } from "./provider/CloudProvider";
import { ConfigProviderContract } from "./ConfigProviderContract";
import { EnvironmentProvider } from "./provider/EnvironmentProvider";
import { DefaultProvider } from "./provider/DefaultProvider";
import { ConfigContract } from "./ConfigContract";

const _ = require('underscore-x');

export class ConfigFactory {

    private static singleton: ConfigContract;
    
    private static providers = [
        new DefaultProvider(),
        new EnvironmentProvider(),
        new StaticProvider(),
        new CloudProvider(),
        new StaticProvider()
    ];

    static async build(path?: string): Promise<ConfigContract> {

        if (!this.singleton) {

            const instance: ConfigSingleton = { get: undefined, content: {} };

            for (const provider of this.providers) {
                (<ConfigProviderContract>provider).setSource(instance.content);
                await provider.load();
                _.extend_x(instance.content, provider.getContent());
            }

            for (const key in instance.content) {
                Object.defineProperty(instance, key, {
                    get: () => {
                        return instance.content[key]
                    }
                });
            }

            instance.get = function (key: string, _default?: any) {
                return instance[key] || _default;
            }.bind({ instance });

            this.singleton = { ...instance.content, ...{ source: { path } } };
        }

        return this.singleton;
    }

}

export interface ConfigSingleton {
    content: any;
    get?(key: string, _default?: any);
}

