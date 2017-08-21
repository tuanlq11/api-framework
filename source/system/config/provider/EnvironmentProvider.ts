"use strict";


import * as path from "path";
import { ConfigProviderImpl } from "../ConfigProviderImpl";

const _ = require('underscore-x');

export class EnvironmentProvider implements ConfigProviderImpl {

    private content: any = {};

    async load() {
        this.parse(process.env);
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

    setSource(config: any): EnvironmentProvider {
        return this;
    }

    private parseRecur(kArr: string[], value: string) {

        if (kArr.length === 0) return value;

        const key   = kArr[0].toLowerCase();
        const kArrN = kArr.slice(1);

        let result = {};

        result[key] = this.parseRecur(kArrN, value);

        return result;
    }

    private parse(data: any) {
        for (const key in data) {
            const kArr = key.split('_');
            const val  = process.env[key];
            if (val === undefined || kArr[0] !== 'APP') continue;

            _.extend_x(this.content, this.parseRecur(kArr.slice(1), val))
        }
    }
}

