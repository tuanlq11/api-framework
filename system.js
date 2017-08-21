'use strict';

function exportAll(module) {
	for (const name in module) {
		if (!exports.hasOwnProperty(name)) exports[name] = module[name];
	}
}

exportAll(require('./dist/source/system/BaseError'));
exportAll(require('./dist/source/system/Injection'));
exportAll(require('./dist/source/system/Logger'));
exportAll(require('./dist/source/system/Retry'));
exportAll(require('./dist/source/system/Storage'));
exportAll(require('./dist/source/system/Util'));

exportAll(require('./dist/source/system/impl/JsonLogger'));
exportAll(require('./dist/source/system/impl/TextLogger'));

exportAll(require('./dist/source/system/config/ConfigFactory'));
