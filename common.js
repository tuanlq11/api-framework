'use strict';

function exportAll(module) {
    for (const name in module) {
        if (!exports.hasOwnProperty(name)) exports[name] = module[name];
    }
}

exportAll(require('./dist/common/Mailer'));
exportAll(require('./dist/common/PasswordEncoder'));
exportAll(require('./dist/common/PDFHelper'));
exportAll(require('./dist/common/RabbitMQ'));
