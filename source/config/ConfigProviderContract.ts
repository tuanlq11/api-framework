import * as merge from "deepmerge";
import { TextLogger as Logger } from '../system/impl/TextLogger';

export abstract class ConfigProviderContract {

    public source: any;
    public content: any = {};

    protected logger: Logger;

    constructor() {
        this.logger = new Logger();
    }

    abstract load();
    abstract exists(key: string): boolean;
    abstract getPath(): string | undefined;

    setSource(source: any) {
        this.content = merge(this.content || {}, source)
    };

}