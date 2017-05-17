import { Logger } from '../Logger';


export class TextLogger extends Logger {

	private log(level: string, message: any) {
		if (level === 'debug') level = 'log';
		console[level](message);
	}


	debug(message: any) {
		this.log('debug', message);
	}


	info(message: any) {
		this.log('info', message);
	}


	warn(message: any) {
		this.log('warn', message);
	}


	error(message: any) {
		this.log('error', message);
	}

}
