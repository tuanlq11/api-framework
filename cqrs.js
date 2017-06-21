'use strict';

function exportAll(module) {
    for (const name in module) {
        if (!exports.hasOwnProperty(name)) exports[name] = module[name];
    }
}

exportAll(require('./dist/source/cqrs/CommandBus'));
exportAll(require('./dist/source/cqrs/InvalidCommand'));

exportAll(require('./dist/source/cqrs/impl/SchemaCommandBus'));
exportAll(require('./dist/source/cqrs/impl/SchemaCloudBus'));
