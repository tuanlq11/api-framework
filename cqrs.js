'use strict';

function exportAll(module) {
    for (const name in module) {
        if (!exports.hasOwnProperty(name)) exports[name] = module[name];
    }
}

exportAll(require('./dist/cqrs/CommandBus'));
exportAll(require('./dist/cqrs/InvalidCommand'));

exportAll(require('./dist/cqrs/impl/SchemaCommandBus'));
exportAll(require('./dist/cqrs/impl/SchemaCloudBus'));
