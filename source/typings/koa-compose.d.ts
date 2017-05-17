declare module 'koa-compose' {

	import { Middleware } from 'koa';

	function compose(stack: Middleware[]): Middleware;

	namespace compose {}

	export = compose;

}
