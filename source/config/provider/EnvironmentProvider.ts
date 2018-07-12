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

    private deepParse(keys: string[], val: string | string[]) {
        let key = keys.shift();
        if (!key) return val;

        return { [camelcase(key)]: this.deepParse(keys, val) };
    }

    private parse(data: any) {
        for (const envKey in data) {
            const keys = envKey.split('_');
            const prefix = keys.shift();
            if (!prefix || prefix !== 'APP') continue;

            const val = arrayData(data[envKey]);

            this.content = merge(this.content, this.deepParse(keys, val));
        }
    }


}

function arrayData(val: string): string | string[] {
    const separated = val.match(/[^[\]]+(?=])/g);

    return separated ? separated[0].split(',') : val;
}

