"use strict";

export interface ConfigProviderImpl {
    load();
    exists(key: string): boolean;
    getPath(): string | undefined;
    getContent(): any;
    setSource(config: any): ConfigProviderImpl;
}