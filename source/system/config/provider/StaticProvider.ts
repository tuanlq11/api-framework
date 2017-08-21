"use strict";


import * as path from "path";
import { ConfigProviderImpl } from "../ConfigProviderImpl";

const _ = require('underscore-x');

export class StaticProvider implements ConfigProviderImpl {

    private source: StaticSource;
    private path: string;

    private content: any = {};

    async load() {
        this.content = require(this.path);
        for (const key in this.content) {
            Object.defineProperty(this, key, {
                get: () => {
                    return this.content[key];
                }
            });
        }
    }

    exists(key: string): boolean {
        return true;
    }

    getPath(): string | undefined {
        return path.join(this.source.data.dir, "config." + this.source.env);
    }

    getContent(): any {
        return this.content;
    }

    setSource(config: StaticSource): StaticProvider {
        this.source = config;
        this.path   = this.getPath() as any;

        return this;
    }
}

export interface StaticSource {
    data: {
        dir: string
    };
    env: string;
}