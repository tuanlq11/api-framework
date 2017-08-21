"use strict";


import * as path from "path";
import { ConfigProviderImpl } from "../ConfigProviderImpl";
import { JsonLogger } from "../../impl/JsonLogger";

const _ = require('underscore-x');

export class StaticProvider implements ConfigProviderImpl {

    private readonly logger: JsonLogger = new JsonLogger();

    private source: StaticSource;
    private path: string;

    private content: any = {};

    async load() {
        this.logger.info(`Fetching static configuration from ${this.path}`);
        this.content = require(this.path);
        this.logger.info(`Fetched static configuration`);
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