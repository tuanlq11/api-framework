import { Router, Prefix } from "../network/Router";
import { Logger } from "../system/Logger";

export function Controller(prefix = '') {

    return function <T extends { new(...agrs): {} }>(constructor: T) {

        Prefix.set(constructor.prototype, prefix);

        return class extends constructor {

            constructor(...args) {
                super(...args);

                const injector = (global as any).__injector;
                if (!injector) {
                    injector.get(Logger).error('[Injector] Router Instance not found.')
                    return;
                }

                injector.get(Router).register(this);
            }

        }

    }

}