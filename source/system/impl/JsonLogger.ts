import { Logger } from '../Logger';


export class JsonLogger extends Logger {

	serializer = (fields: Object) => fields;


	private log(level: string, message: any) {

		const timestamp = new Date().toJSON();
		const fields = { level, message, timestamp };
		const entry = this.serializer(fields);
		const line = JSON.stringify(entry);
		console.log(line);

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
