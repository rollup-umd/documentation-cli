/* eslint-disable no-undef, no-param-reassign, global-require, no-unused-vars, no-console, no-underscore-dangle, prefer-destructuring */
const execa = require('execa');
const path = require('path');
const fs = require('fs');

exports.command = 'ribbon';
exports.desc = 'Update to ribbon according to the repository value in package.json';
exports.builder = (yargs) => yargs
  .option('path', {
    alias: 'p',
    describe: 'path',
    default: process.cwd(),
  });
exports.handler = async (argv) => {
  switch (argv.path[0]) {
    case '/':
      break;
    default:
      argv.path = argv.path[1] === '/' ? path.join(process.cwd(), argv.path.slice(2)) : path.join(process.cwd(), argv.path);
      break;
  }
  const { repository: { url } } = require(path.join(argv.path, 'package.json'));
  const cfgPath = path.join(argv.path, 'styleguide/styleguide.ext.json');
  const cfg = require(cfgPath);

  const repoName = url.indexOf('github.com') !== -1 ? 'GitHub' : 'GitLab';

  const { stdout: repoUrl } = await execa.shell(`node ${argv.$0} meta http-url -p ${argv.path}`);

  const ribbon = {
    url: repoUrl,
    text: `Fork us on ${repoName}`,
  };

  fs.writeFileSync(cfgPath, JSON.stringify({ ...cfg, ribbon }, null, 2), 'utf8');
  console.log(`[Success] Ribbon is: ${ribbon.text}: ${ribbon.url}`);
};
