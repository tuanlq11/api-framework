declare module 'co-body' {

	import * as http from 'http';

	interface Context {
		req: http.IncomingMessage;
	}

	function json(context: Context): Promise<any>;

}
