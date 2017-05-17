import * as request from 'supertest';
import { expect } from 'chai';

import { autoInject, bootstrap } from '../../system';
import { Context, Http, Koa, Router } from '../../network';


@autoInject
class Controller {

	@Http.post('/note')

	private save(context: Context) {
		expect(context.request.body).to.deep.equal({ name: 'Batman' });
		context.status = 204; // No Content
	}


	@Http.get('/note')

	private read(context: Context) {
		context.body = Promise.resolve({ name: 'Bruce Wayne' });
	}

}


@autoInject
class Application {

	private koa = new Koa();

	constructor(controller: Controller, router: Router) {
		router.register(controller);
		this.koa.use(router.middleware());
	}

	listen() {
		return this.koa.listen();
	}

}


test('Router', async function() {

	const app = bootstrap(Application, []);
	const agent = request.agent(app.listen());

	const res1 = await agent.post('/note').send({ name: 'Batman' });
	expect(res1.status).to.equal(204);

	const res2 = await agent.get('/note');
	expect(res2.body).to.deep.equal({ name: 'Bruce Wayne' });

});
