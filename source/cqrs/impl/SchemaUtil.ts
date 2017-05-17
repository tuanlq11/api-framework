import * as Validator from 'is-my-json-valid';

import { InvalidCommand } from '../InvalidCommand';


const messageMap = {

	'is required': 'required',
	'is the wrong type': 'type',
	'is less than minimum': 'minimum',

	'must be unique': 'uniqueItems',

	'must be date format': 'date',
	'must be email format': 'email',
	'must be an enum value': 'enum',

	'has less items than allowed': 'minItems',
	'has less length than allowed': 'minLength',

	'has longer length than allowed': 'maxLength',

};


export function convert(errors: Validator.Error[]): InvalidCommand.ErrorDict {

	const dict = {};

	for (const error of errors) {
		const field = error.field.replace(/^data\./, '');
		const message = messageMap[error.message];
		dict[field] = message;
	}

	return dict;

}
