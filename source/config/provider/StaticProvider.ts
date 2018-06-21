"use strict";

import * as path from "path";
import { ConfigProviderContract } from "../ConfigProviderContract";

export class StaticProvider extends ConfigProviderContract {

    private path: string;

    async load() {
        
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