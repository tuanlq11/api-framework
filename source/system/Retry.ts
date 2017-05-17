import * as assert from 'assert';

import { BaseError } from './BaseError';
import { Logger } from './Logger';
import { sleep } from './Util';


interface RetryOptionDict {
	readonly logger: Logger;
	readonly condition: string;
	readonly delayTime: (attempt: number) => number;
	readonly maxAttempts: number;
}


class MaxAttemptsReached extends BaseError {}


export async function retry<T>(fn: () => Promise<T>, options: RetryOptionDict) {

	let result;
	let success = false;

	for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {

		try {
			assert(!success);
			result = await fn();
			success = true;
			break;
		} catch (error) {
			if (error.message === options.condition) {
				if (attempt < options.maxAttempts) {
					await delay(attempt, options);
				}
			} else {
				throw error;
			}
		}

	}

	if (!success) throw new MaxAttemptsReached();
	return result as T;

}


async function delay(attempt: number, options: RetryOptionDict) {

	const time = options.delayTime(attempt);
	const message = `Attempt #${ attempt } failed, retry in ${ time }ms`;

	options.logger.debug(message);
	await sleep(time);

}
