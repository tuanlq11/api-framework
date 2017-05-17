declare module 'koa' {

	import * as events from 'events';
	import * as http from 'http';

	import * as Cookies from 'cookies';


	interface Dictionary {
		[key: string]: string;
	}


	interface Request {

		body: any;
		header: Dictionary;
		hostname: string;
		method: string;
		path: string;
		query: Dictionary;

		get(field: string): string;
		is(...types: string[]): string | false;

	}


	interface Response {

		body: any;
		status: number;
		type: string;

		set(field: string, value: string): void;

	}


	interface Context {

		req: http.IncomingMessage;
		res: http.ServerResponse;
		respond: boolean;

		request: Request;
		response: Response;

		cookies: Cookies;
		state: any;

		throw(status: number): never;

		// Request

		header: Dictionary;

		/**
		 * Parse the `Host` header field hostname
		 * and support `X-Forwarded-Host` when `app.proxy` is true.
		 */
		hostname: string;

		method: string;
		path: string;
		query: Dictionary;

		get(field: string): string;
		is(...types: string[]): string | false;

		// Response

		body: any;
		status: number;
		type: string;

		set(field: string, value: string): void;

	}


	interface Next {
		(): Promise<void>;
	}


	interface Middleware {
		(context: Context, next: Next): Promise<void>;
	}


	type IContext = Context;
	type INext = Next;
	type IMiddleware = Middleware;

	namespace Koa {
		type Context = IContext;
		type Next = INext;
		type Middleware = IMiddleware;
	}


	class Koa extends events.EventEmitter {

		proxy: boolean;

		use(middleware: Middleware): this;

		listen(): http.Server;
		listen(port: number): http.Server;

	}


	export = Koa;

}
