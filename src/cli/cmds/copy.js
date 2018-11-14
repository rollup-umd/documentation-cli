/* eslint-disable no-undef, no-param-reassign, global-require, no-unused-vars, no-console, no-underscore-dangle, prefer-destructuring, no-shadow */
const async = require('async');
const path = require('path');
const fs = require('fs');

const { spawn: spawnDefault, exec: execDefault } = require('child_process');

const exec = (command, cb) => {
  execDefault(command, {
    maxBuffer: 1024 * 1024,
  }, cb);
};
const spawn = (command, cb) => {
  const split = command.split(' ');
  const program = split[0];
  const args = split.slice(1);
  const child = spawnDefault(program, args || []);
  const outputList = [];
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (data) => outputList.push(data) && console.log(data.replace(/\n$/, '')));
  child.stderr.on('data', (data) => outputList.push(data) && console.log(data.replace(/\n$/, '')));
  child.on('close', (code) => code === 1 ? cb(new Error(`child process exited with code ${code}`, [outputList.join('')])) : cb(null, [outputList.join('')]));
};

exports.command = 'copy';
exports.desc = 'Copy template documentation from `internal/templates/docs` to `docs`.';
exports.builder = (yargs) => yargs
  .option('path', {
    alias: 'p',
    describe: 'path',
    default: process.cwd(),
  });
exports.handler = (argv, cb) => {
  switch (argv.path[0]) {
    case '/':
      break;
    default:
      argv.path = argv.path[1] === '/' ? path.join(process.cwd(), argv.path.slice(2)) : path.join(process.cwd(), argv.path);
      break;
  }

  const p = path.join(argv.path, 'internals/templates/docs');
  const d = path.join(argv.path, 'docs');
  async.series([
    (cb) => spawn(`mkdir -p ${d}`, cb),
  ], (err, results) => {
    if (err) {
      console.error(`[ERROR] ${err.message}`);
      process.exit(1);
    }
    const files = fs.readdirSync(p);
    async.map(files, (file, done) => spawn(`cp ${path.join(p, file)} ${path.join(d, file)}`, done), (err, results) => {
      if (err) {
        console.error(`[ERROR] ${err.message}`);
        process.exit(1);
      }
      if (cb) {
        cb(null, results);
      }
    });
  });
};
