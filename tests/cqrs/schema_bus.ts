import { join } from 'path';
import { expect } from 'chai';
import { SchemaCommandBus } from '../../cqrs';


class CreateUniverse {

	static readonly SCHEMA_FILE = 'create.yaml';

	readonly name: string;

	constructor(data: CreateUniverse) {
		Object.assign(this, data);
	}

}


class DestroyUniverse {

	static readonly SCHEMA_FILE = 'file_not_found.yaml';

}


class Handler {

	name: string;

	async create(command: CreateUniverse) {
		this.name = command.name;
	}

}


test('SchemaCommandBus', async function() {

	const bus = new SchemaCommandBus();
	const handler = new Handler();

	{
		bus.register(CreateUniverse, command => handler.create(command));
		bus.setSchemaPath(join(__dirname, '../../../tests/cqrs'));
		await bus.resolve();
	}
	{
		const command = new CreateUniverse({ name: 'Marvel' });
		await bus.execute(command);
		expect(handler.name).to.equal('Marvel');
	}
	{
		const command = new CreateUniverse({ name: '' });
		try {
			await bus.execute(command);
		} catch (e) {
			expect(e.errors).to.deep.equal({ name: 'minLength' });
		}
		expect(handler.name).to.equal('Marvel');
	}
	{
		let failed = false;
		bus.register(DestroyUniverse, async () => {});
		try {
			await bus.resolve();
		} catch (e) {
			failed = true;
		}
		expect(failed).to.be.true;
	}

});
