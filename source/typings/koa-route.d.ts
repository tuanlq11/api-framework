declare module 'koa-route' {

	import { Context, Middleware } from 'koa';

	interface Handler {
		(context: Context, ...args: string[]): void | Promise<void>;
	}

	interface Factory {
		(path: string, handler: Handler): Middleware;
	}

	var Route: {
		readonly [method: string]: Factory;
	};

	type IHandler = Handler;

	namespace Route {
		type Handler = IHandler;
	}

	export = Route;

}
