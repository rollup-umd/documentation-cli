/* eslint-disable no-undef, no-param-reassign, global-require, no-unused-vars, no-console, no-underscore-dangle, prefer-destructuring */
const async = require('async');
const path = require('path');
const glob = require('glob');
const { sedReplace } = require('../utils');

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

exports.command = 'variable <variable> [variables..]';
exports.desc = 'Replace variable(s) in {{docs,src/components}/**/*.md,*.md} (eg: `SOMETHING=value`)';
exports.builder = (yargs) => yargs
  .option('path', {
    alias: 'p',
    describe: 'path',
    default: process.cwd(),
  })
  .option('only-doc', {
    alias: 'd',
    describe: 'Replace variable(s) only in {docs,src/components}/**/*.md',
    default: false,
  });
exports.handler = (argv) => {
  switch (argv.path[0]) {
    case '/':
      break;
    default:
      argv.path = argv.path[1] === '/' ? path.join(process.cwd(), argv.path.slice(2)) : path.join(process.cwd(), argv.path);
      break;
  }
  const pattern = path.join(argv.path, argv['only-doc'] ? '{docs,src/components}/**/*.md' : '{{docs,src/components}/**/*.md,*.md}');
  const options = {
    nonull: false,
  };
  glob(pattern, options, (er, files) => {
    files.forEach((file) => {
      async.map([].concat(argv.variable).concat(argv.variables), (variable, cb) => {
        const split = variable.split('=');
        let before = split[0];
        before = before[0] === '$' ? before : `$${before}`;
        const after = split[1];
        const output = file;
        sedReplace(output, before, after, output, cb);
      }, (err, results) => {
        if (err) {
          console.error(`[ERROR] ${err.message}`);
          process.exit(1);
        }
      });
    });
  });
};
