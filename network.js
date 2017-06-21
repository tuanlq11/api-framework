'use strict';

function exportAll(module) {
    for (const name in module) {
        if (!exports.hasOwnProperty(name)) exports[name] = module[name];
    }
}

const Http           = require('./dist/source/network/Http');
exports.Http         = Http.Http;
exports.HttpMetadata = Http.HttpMetadata;

exportAll(require('./dist/source/network/Error'));
exportAll(require('./dist/source/network/Koa'));
exportAll(require('./dist/source/network/Router'));
