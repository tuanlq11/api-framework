"use strict";

export interface ConfigProviderContract {
    load();
    exists(key: string): boolean;
    getPath(): string | undefined;
    getContent(): any;
    setSource(config: any): ConfigProviderContract;
}