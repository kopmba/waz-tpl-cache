'use strict';

var pt      = require('path');
var through = require('through2');
var File    = require('vinyl');

/**
 * @param {Object}   [options]
 * @param {Function} [options.fileName]
 * @param {Function} [options.globalVariable]
 * @param {Function} [options.nameFunction]
 */
module.exports = function templateCache(options) {
    options = options || {};


    options.fileName = options.fileName || 'templates.ts';
    options.globalVariable = options.globalVariable || 'caches';
    options.nameFunction = options.nameFunction || nameFunction_default;

    var js = 'export class CacheTpl {\n   ' + ' static builder(){\n   ' + ' let caches = {}; \n';
    return through.obj(
        function transform(file, e, done) {
            if (file.isBuffer()) {
                js += '    ' + convertHtml(file.contents.toString(), file.relative, options);
            }
            done(null);
        },
        function flush(done) {
            //@deprecatedjs += '}());'; 
            js += '  return caches;\n  ' + ' }\n};';
            this.push(new File({
                path: options.fileName,
                contents: new Buffer(js)
            }));
            done(null);
        }
    );
}

function nameFunction_default(templatePath) {
    return templatePath;
}

function convertHtml(view, path, options) {
    var wrapped = "'" + view.replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";

    return 'caches[\''+
        options.nameFunction(path).replace(/'/g, "\\'") + '\'] = ' + wrapped + ';\n';
}
