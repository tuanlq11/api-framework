import * as compose from 'koa-compose';
import * as Origin from 'koa-router';

import { json as parse } from 'co-body';
import { Context } from 'koa';

import { HttpMetadata } from './Http';

const ROUTE_PREFIX = Symbol('route:prefix');


export class Router {

	private readonly router: Origin;

	constructor() {
		this.router = new Origin();
	}

	register(controller) {
		const annotations = HttpMetadata.get(controller);

		for (const route of annotations.values()) {
			const handler = controller[route.property].bind(controller);

			this.router[route.httpMethod](route.routePath, handler);
		}
	}

	getRoutes() {
		return this.router.routes();
	}

	middleware() {
		return compose([parseBody, awaitBody, this.getRoutes(), this.router.allowedMethods()]);
	}

}


async function parseBody(context: Context, next: Function) {
	if (context.is('json')) {
		context.request['body'] = await parse(context);
	}
	await next();
}


async function awaitBody(context: Context, next: Function) {
	await next();
	if (context.body && context.body.then) {
		context.body = await context.body;
	}
}