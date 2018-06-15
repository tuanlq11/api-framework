"use strict";

import * as path from "path";
import { ConfigProviderContract } from "../ConfigProviderContract";
import { TextLogger } from "../../../system/impl/TextLogger";

export class StaticProvider extends ConfigProviderContract {

    private readonly logger = new TextLogger();

    private path: string;

    async load() {
        
        this.logger.debug(`Local Configuration: ${this.path}`);
        this.content = require(this.path);
        this.logger.info(`Local Configuration: Loaded`);

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
        const { source: { data, env } } = this;
        return path.join(data.dir, "config." + env);
    }

    getContent(): any {
        return this.content;
    }

    setSource(config: any): StaticProvider {
        this.source = config;
        this.path = this.getPath() as any;

        return this;
    }
}