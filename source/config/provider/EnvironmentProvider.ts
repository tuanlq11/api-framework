"use strict";

import { ConfigProviderContract } from '../ConfigProviderContract';
import * as camelcase from 'camelcase';
import * as merge from 'deepmerge';

export class EnvironmentProvider extends ConfigProviderContract {

    async load() {
        this.parse(process.env);
        this.logger.info(`ENV Configuration: Loaded`);
    }

    exists(key: string): boolean {
        return true;
    }

    getPath(): string | undefined {
        return undefined;
    }

    getContent(): any {
        return this.content;
    }

    private deepParse(keys: string[], val: string) {
        const key = keys.shift();
        if (!key) return val;

        return { [camelcase(key)]: this.deepParse(keys, val) };
    }

    private parse(data: any) {
        for (const envKey in data) {
            const keys = envKey.split('_');
            const prefix = keys.shift();
            if (!prefix || prefix !== 'APP') continue;

            this.content = merge(this.content, this.deepParse(keys, data[envKey]));
        }
    }
}

