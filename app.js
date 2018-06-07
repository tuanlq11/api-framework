'use strict';

function exportAll(module) {
    for (const name in module) {
        if (!exports.hasOwnProperty(name)) exports[name] = module[name];
    }
}

exportAll(require('./dist/app/config/ConfigFactory'));
exportAll(require('./dist/app/config/ConfigImpl'));