'use strict';


global.__metadata = Reflect.metadata;


global.__decorate = function(decorators, target, key, desc) {

	const count = arguments.length;
	if (count > 3 && desc === null) desc = Object.getOwnPropertyDescriptor(target, key);

	const result = Reflect.decorate(decorators, target, key, desc);
	if (count > 3 && result) Object.defineProperty(target, key, result);

	return result;

};


global.__awaiter = function(self, args, _, func) {

	const generator = func.apply(self, args);

	return new Promise(function(resolve, reject) {

		function fulfilled(value) {
			try {
				step(generator.next(value));
			} catch (e) {
				reject(e);
			}
		}

		function rejected(value) {
			try {
				step(generator.throw(value));
			} catch (e) {
				reject(e);
			}
		}

		function step(result) {
			if (result.done) {
				resolve(result.value);
			} else {
				Promise.resolve(result.value).then(fulfilled, rejected);
			}
		}

		step(generator.next());

	});

};
