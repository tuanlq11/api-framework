import * as merge from "deepmerge";

export abstract class ConfigProviderContract {

    source: any;
    content: any;

    abstract load();
    abstract exists(key: string): boolean;
    abstract getPath(): string | undefined;

    setSource(source: any) {
        this.content = merge(this.content || {}, source)
    };

}