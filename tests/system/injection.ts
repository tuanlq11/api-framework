import { expect } from 'chai';
import { autoInject, component, bootstrap } from '../../system';


abstract class Config {}

abstract class Session {}

class HttpSession extends Session {}


@autoInject
class NoteComponent {

	constructor(session: Session, httpSession: HttpSession) {
		expect(session).to.equal(httpSession);
	}

}


@component({
	implClasses: [HttpSession],
})
class Application {

	constructor(config: Config, note: NoteComponent) {
		expect(config).to.deep.equal({ name: 'John' });
	}

}


test('Dependency Injection', async function() {

	const config = { name: 'John' };

	const app = bootstrap(Application, [
		{ provide: Config, useValue: config },
	]);

	expect(app).to.be.instanceOf(Application);

});
