/// <reference types="reflect-metadata" />

const HTTP_LIST = Symbol('http:list');


interface Annotation {
    httpMethod: string;
    routePath: string;
    property: any;
}


type Descriptor = TypedPropertyDescriptor<Function>;

function create(httpMethod: string) {
    return function factory(routePath: string) {
        return function annotate(target, property) {

            const value = Reflect.getMetadata(HTTP_LIST, target);
            const list = (value as Map<String, Annotation>) || new Map<String, Annotation>();

            list.set(property, { httpMethod, routePath, property });
            Reflect.defineMetadata(HTTP_LIST, list, target);
        };

    };

}


const Http = {
    get: create('get'),
    head: create('head'),
    trace: create('trace'),
    delete: create('delete'),
    patch: create('patch'),
    post: create('post'),
    put: create('put')
};


const HttpMetadata = {

    get(target): Map<String, Annotation> {
        return Reflect.getMetadata(HTTP_LIST, target);
    }

};


export { Http, HttpMetadata };