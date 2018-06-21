import * as compose from 'koa-compose';
import * as methods from 'koa-route';

import { json as parse } from 'co-body';
import { Context, Next } from 'koa';

import { HttpMetadata } from './Http';

interface Handler {
	(context: Context, ...args: string[]): void | Promise<void>
}

interface Route {
	handler: Handler;
	method: string;
	path: string;
}


export class Router {

	private readonly routes: Route[];

	constructor() {
		this.routes = [];
	}

	register(controller) {
		const annotations = HttpMetadata.get(controller);

		const routes = annotations.map(item => ({
			handler: controller[item.property].bind(controller),
			method: item.httpMethod,
			path: item.routePath,
		} as Route));

		this.routes.push(...routes);
	}


	getRoutes() {
		return this.routes;
	}


	middleware() {
		const stack = this.routes.map(route => {
			return methods[route.method](route.path, route.handler);
		});
		return compose([parseBody, awaitBody, ...stack]);
	}

}


async function parseBody(context: Context, next: Next) {
	if (context.is('json')) {
		context.request.body = await parse(context);
	}
	await next();
}


async function awaitBody(context: Context, next: Next) {
	await next();
	if (context.body && context.body.then) {
		context.body = await context.body;
	}
}
