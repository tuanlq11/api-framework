/// <reference path="../typings/koa-route.d.ts" />
/// <reference path="../typings/reflect-metadata.d.ts" />

import { Handler } from 'koa-route';


const HTTP_LIST = Symbol('http:list');


interface Annotation {
	httpMethod: string;
	routePath: string;
	property: any;
}


type Descriptor = TypedPropertyDescriptor<Handler>;

function create(method: string) {
	return function factory(path: string) {
		return function annotate(target, key, desc: Descriptor) {
			const value = Reflect.getMetadata(HTTP_LIST, target);
			const list = (value as Annotation[]) || [];
			list.push({ httpMethod: method, routePath: path, property: key });
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
	put: create('put'),
};


const HttpMetadata = {

	get(target): Annotation[] {
		return Reflect.getMetadata(HTTP_LIST, target);
	},

};


export { Http, HttpMetadata };
