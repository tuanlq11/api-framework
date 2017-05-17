'use strict';

function exportAll(module) {
	for (const name in module) {
		if (!exports.hasOwnProperty(name)) exports[name] = module[name];
	}
}

const Http = require('./dist/network/Http');
exports.Http = Http.Http;

exportAll(require('./dist/network/Error'));
exportAll(require('./dist/network/Koa'));
exportAll(require('./dist/network/Router'));
