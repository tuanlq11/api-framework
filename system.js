'use strict';

function exportAll(module) {
	for (const name in module) {
		if (!exports.hasOwnProperty(name)) exports[name] = module[name];
	}
}

exportAll(require('./dist/system/BaseError'));
exportAll(require('./dist/system/Injection'));
exportAll(require('./dist/system/Logger'));
exportAll(require('./dist/system/Retry'));
exportAll(require('./dist/system/Storage'));
exportAll(require('./dist/system/Util'));

exportAll(require('./dist/system/impl/JsonLogger'));
exportAll(require('./dist/system/impl/TextLogger'));
