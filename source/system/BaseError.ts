export class BaseError extends Error {

	get name() {
		return this.constructor.name;
	}

}
