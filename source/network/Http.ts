/// <reference path="../typings/koa-route.d.ts" />
/// <reference path="../typings/reflect-metadata.d.ts" />

import { Handler } from 'koa-route';
// import { Context } from '../../network';

const HTTP_LIST = Symbol('http:list');


interface Annotation {
    httpMethod: string;
    routePath: string;
    property: any;
}


type Descriptor = TypedPropertyDescriptor<Handler>;

function create(method: string) {
    return function factory(path: string, produces?: string) {
        return function annotate(target, key, desc: Descriptor) {

            const value = Reflect.getMetadata(HTTP_LIST, target);
            const list  = (value as Annotation[]) || [];

            const actuators = (global as any).actuators || {};

            list.push({ httpMethod: method, routePath: path, property: key });

            Reflect.defineMetadata(HTTP_LIST, list, target);

            /* ########################### Actuator ########################## */
            actuators[path] = actuators[path] || { methods: [], produces: [] };

            actuators[path].methods.push(method);

            (global as any).actuators = actuators;

        };

    };

}


const Http = {
    get:    create('get'),
    head:   create('head'),
    trace:  create('trace'),
    delete: create('delete'),
    patch:  create('patch'),
    post:   create('post'),
    put:    create('put'),
};


const HttpMetadata = {

    get(target): Annotation[] {
        return Reflect.getMetadata(HTTP_LIST, target);
    },

    actuators: (appName: string) => {
        const result = {};

        for (const path in (global as any).actuators) {
            const actuator                                                                                                                           = (global as any).actuators[path];
            result[`{[/${appName.toLowerCase().concat(path)}],methods=[${actuator.methods.toString()}],produces=[${actuator.produces.toString()}]}`] = {};
        }

        return result;
    },

};


export { Http, HttpMetadata };