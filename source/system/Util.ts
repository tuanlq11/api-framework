const APP_ENV = process.env.APP_ENV || 'prod';

export function isEnv(...list: string[]) {
	return list.indexOf(APP_ENV) !== -1;
}


export function sleep(milliseconds: number) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
